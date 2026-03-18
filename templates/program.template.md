# [System] — Autonomous Optimization Program

> Inspired by: karpathy/autoresearch
> Owner: [Your name]
> Status: Runnable

---

## Objective

[What this program optimizes. One sentence.]

---

## Primary metric

| Metric | Description | Target |
|---|---|---|
| `[metric_1]` | [What it measures] | [Threshold, e.g., ≥ 0.80] |
| `[metric_2]` | [What it measures] | [Threshold] |

---

## Experiment parameters

The agent CAN only modify these:

```python
PARAMS = {
    "[param_1]": [value_a, value_b, value_c],
    "[param_2]": [value_x, value_y],
}
```

The agent CANNOT modify:
- [Fixed component 1]
- [Fixed component 2]
- The evaluation dataset

---

## Evaluation set

[N] known examples with verifiable answers.
Stored in: `eval/[name].json`

---

## Loop protocol

```
1. init_experiment(params)
   - Select untried param combination
   - Setup the system with those params

2. run_experiment(params, eval_set)
   - Run each example through the system
   - Record outputs and scores

3. log_experiment(params, metrics)
   - Save to experiments/log.jsonl: {timestamp, params, metrics, delta_vs_best}
   - If hard constraint violated: mark FAILED, skip

4. compare_vs_baseline(metrics)
   - If improves primary metric without degrading others: update best_config.json → log IMPROVED
   - Otherwise: log NO_IMPROVEMENT

5. stop_condition()
   - All param combinations tried, OR
   - N consecutive iterations without improvement after M experiments, OR
   - Primary metric reaches target
   - Generate: experiments/final_report.md

6. Loop from step 1
```

---

## File structure

```
[project]/
├── program.md               ← this file
├── eval/
│   └── [name].json          ← evaluation set
├── experiments/
│   ├── log.jsonl            ← all experiment records
│   ├── best_config.json     ← best config so far
│   └── final_report.md      ← generated at completion
└── [core script]            ← the thing being optimized
```

---

## Time budget

- Max time per experiment: [N] minutes
- Max total iterations: [N]
- If iteration exceeds budget: log TIMEOUT, continue with next

---

## Improvement criterion

A configuration is better if it improves at least one primary metric
without degrading any other metric by more than [X]%.

Hard failure condition: if [hard_constraint] is violated, the configuration
is automatically discarded regardless of other metrics.

---

## Output

`experiments/final_report.md` must contain:
1. Best configuration found (full params)
2. Final metrics vs baseline
3. Top 3 configurations by metric
4. Key findings: which params had most impact
5. Next experiments to try (if target not reached)
