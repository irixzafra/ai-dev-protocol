#!/usr/bin/env python3
"""
Agent Wrapper - Automates any CLI as an orchestrator agent

Usage:
    python agent-wrapper.py --agent gemini-a --cli "claude -p"
    python agent-wrapper.py --agent qwen-a --cli "aider --yes"
    python agent-wrapper.py --agent codex-a --cli "gh copilot suggest"

The wrapper:
1. Queries pending tasks via HTTP API
2. Executes the CLI with the task
3. Reports result via HTTP API
4. Repeats
"""

import argparse
import subprocess
import requests
import time
import json
import os
import sys
from datetime import datetime

# Optional: pexpect for persistent sessions
try:
    import pexpect
    PEXPECT_AVAILABLE = True
except ImportError:
    PEXPECT_AVAILABLE = False

API_URL = os.environ.get("ORCHESTRATOR_URL", "http://localhost:3847")


class PersistentShell:
    """
    Persistent shell that maintains state between commands.
    Useful when agents need to navigate directories or maintain variables.

    Usage:
        shell = PersistentShell("/path/to/project")
        output = shell.run("cd src && ls")
        output = shell.run("pwd")  # Still in /path/to/project/src
    """

    def __init__(self, working_dir: str = None):
        if not PEXPECT_AVAILABLE:
            raise ImportError("pexpect not available. Install with: pip install pexpect")

        self.working_dir = working_dir or os.getcwd()
        self.shell = pexpect.spawn(
            "/bin/bash",
            cwd=self.working_dir,
            encoding="utf-8",
            timeout=300
        )
        # Unique prompt to detect command completion
        self.prompt = "___AGENT_WRAPPER_READY___"
        self.shell.sendline(f'PS1="{self.prompt}"')
        self.shell.expect(self.prompt)

    def run(self, command: str, timeout: int = 300) -> str:
        """Execute command and return output"""
        self.shell.sendline(command)
        self.shell.expect(self.prompt, timeout=timeout)
        # Clean output (remove command echo and prompt)
        output = self.shell.before
        lines = output.split("\n")[1:]  # Skip the command echo
        return "\n".join(lines).strip()

    def close(self):
        """Close the shell"""
        self.shell.close()

def get_pending_tasks(agent_id: str) -> list:
    """Get pending tasks for this agent"""
    try:
        resp = requests.get(f"{API_URL}/tasks/{agent_id}", timeout=5)
        data = resp.json()
        return [t for t in data.get("tasks", []) if t["status"] == "pending"]
    except Exception as e:
        print(f"Warning: Error fetching tasks: {e}")
        return []

def claim_task(agent_id: str, task_id: str) -> bool:
    """Claim a task"""
    try:
        resp = requests.post(
            f"{API_URL}/task/claim",
            json={"agentId": agent_id, "taskId": task_id},
            timeout=5
        )
        return resp.json().get("success", False)
    except Exception as e:
        print(f"Warning: Error claiming task: {e}")
        return False

def report_complete(agent_id: str, task_id: str, output: str, files_changed: list = None):
    """Report task completed"""
    try:
        requests.post(
            f"{API_URL}/report/complete",
            json={
                "agentId": agent_id,
                "taskId": task_id,
                "filesChanged": files_changed or [],
                "checkpoint": "",
                "notes": output[:500]  # First 500 chars of output
            },
            timeout=5
        )
        print(f"Reported: {task_id} completed")
    except Exception as e:
        print(f"Warning: Error reporting: {e}")

def report_blocker(agent_id: str, task_id: str, error: str):
    """Report blocker"""
    try:
        requests.post(
            f"{API_URL}/report/blocker",
            json={
                "agentId": agent_id,
                "taskId": task_id,
                "blockers": [error[:200]],
                "notes": error
            },
            timeout=5
        )
        print(f"Reported: {task_id} blocked - {error[:50]}...")
    except Exception as e:
        print(f"Warning: Error reporting blocker: {e}")

def git_sync(project_dir: str) -> bool:
    """
    Sync with git before working to avoid drift.
    Does pull --rebase if there are remote changes.
    """
    try:
        result = subprocess.run(
            "git pull --rebase --autostash 2>&1 || true",
            shell=True,
            capture_output=True,
            text=True,
            cwd=project_dir,
            timeout=60
        )
        if "CONFLICT" in result.stdout:
            print(f"Warning: Git conflict detected. Resolving with --abort...")
            subprocess.run("git rebase --abort", shell=True, cwd=project_dir)
            return False
        return True
    except Exception as e:
        print(f"Warning: Git sync error: {e}")
        return True  # Continue anyway


def execute_cli(cli_command: str, task_description: str, timeout_secs: int = 300) -> tuple:
    """
    Execute the CLI command with the task in a persistent shell.
    Returns: (success: bool, output: str)
    """
    project_dir = os.environ.get("PROJECT_DIR", os.getcwd())

    # Sync with git before working
    if os.path.exists(os.path.join(project_dir, ".git")):
        print("Syncing with git...")
        git_sync(project_dir)

    # Escape quotes in the description
    safe_description = task_description.replace('"', '\\"').replace("'", "\\'")

    # Build command with cd to project first (maintains context)
    full_command = f'cd "{project_dir}" && {cli_command} "{safe_description}"'

    print(f"Executing in {project_dir}:")
    print(f"   {cli_command} [task...]")

    try:
        result = subprocess.run(
            full_command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout_secs,
            # Inherit important environment variables
            env={
                **os.environ,
                "PROJECT_DIR": project_dir,
                "ORCHESTRATOR_URL": API_URL,
            }
        )

        output = result.stdout + result.stderr
        success = result.returncode == 0

        if not success and not output:
            output = f"Exit code: {result.returncode}"

        return success, output

    except subprocess.TimeoutExpired:
        return False, f"Timeout after {timeout_secs}s"
    except Exception as e:
        return False, str(e)

def run_agent_loop(agent_id: str, cli_command: str, poll_interval: int = 10):
    """Main agent loop"""
    print(f"""
==============================================================
  Agent Wrapper: {agent_id}
  CLI: {cli_command}
  API: {API_URL}
==============================================================
    """)

    while True:
        # 1. Find pending tasks
        tasks = get_pending_tasks(agent_id)

        if tasks:
            task = tasks[0]  # Take the first one
            task_id = task["taskId"]
            description = task["description"]

            print(f"\nNew task: {task_id}")
            print(f"   {description[:100]}...")

            # 2. Claim the task
            if not claim_task(agent_id, task_id):
                print("   Warning: Could not claim, someone else took it")
                continue

            # 3. Execute CLI
            success, output = execute_cli(cli_command, description)

            # 4. Report result
            if success:
                report_complete(agent_id, task_id, output)
            else:
                report_blocker(agent_id, task_id, output)

        else:
            # No tasks, show dot to indicate alive
            print(".", end="", flush=True)

        time.sleep(poll_interval)

def main():
    parser = argparse.ArgumentParser(
        description="Agent Wrapper - Automates CLIs as orchestrator agents",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Wrapper for Claude CLI
  python agent-wrapper.py -a claude-b -c "claude -p"

  # Wrapper for Aider (auto-accepts changes)
  python agent-wrapper.py -a aider-1 -c "aider --yes --message"

  # One-shot mode (one task and exit)
  python agent-wrapper.py -a test -c "echo" --once

  # With persistent shell (maintains directory state)
  python agent-wrapper.py -a worker -c "bash -c" --persistent

Environment variables:
  PROJECT_DIR       Working directory (default: cwd)
  ORCHESTRATOR_URL  Server URL (default: http://localhost:3847)
"""
    )
    parser.add_argument("--agent", "-a", required=True, help="Agent ID (e.g., gemini-a)")
    parser.add_argument("--cli", "-c", required=True, help="CLI command to execute (e.g., 'claude -p')")
    parser.add_argument("--poll", "-p", type=int, default=10, help="Polling interval in seconds")
    parser.add_argument("--once", action="store_true", help="Execute once and exit")
    parser.add_argument("--persistent", action="store_true",
                        help="Use persistent shell (requires pexpect)")

    args = parser.parse_args()

    # Check pexpect if persistent mode requested
    if args.persistent and not PEXPECT_AVAILABLE:
        print("Warning: --persistent requires pexpect. Installing...")
        os.system("pip install pexpect --break-system-packages -q")
        print("   Restart the script to use persistent mode.")
        sys.exit(1)

    if args.once:
        # One-shot mode: execute one task and exit
        tasks = get_pending_tasks(args.agent)
        if tasks:
            task = tasks[0]
            if claim_task(args.agent, task["taskId"]):
                success, output = execute_cli(args.cli, task["description"])
                if success:
                    report_complete(args.agent, task["taskId"], output)
                else:
                    report_blocker(args.agent, task["taskId"], output)
        else:
            print("No pending tasks")
    else:
        # Daemon mode: infinite loop
        try:
            run_agent_loop(args.agent, args.cli, args.poll)
        except KeyboardInterrupt:
            print("\n\nAgent wrapper stopped")

if __name__ == "__main__":
    main()
