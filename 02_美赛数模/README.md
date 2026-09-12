# 2026 美国大学生数学建模竞赛（MCM Problem C）

## 这题在做什么

赛题给了一档舞蹈真人秀（DWTS）多年的数据：每季每周谁入围、淘汰，还有评委打分和观众投票结果。要求建模还原票数、排名和淘汰的生成机制。`2026_MCM_Problem_C_Data.csv` 是官方原始数据。

我主要做了三件事：

1. **逆向还原投票机制**：观察数据，猜投票大致是"基础人气 + 当周表现 + 行业/国籍加成"合成的，然后写蒙特卡洛模拟器（`2026mcm—c.py`、`mcmc_simulation.py`），跑几千次模拟，看模拟结果和真实淘汰记录是否对得上。
2. **分析影响因素**：用随机森林跑特征重要性，量化"评委打分 vs 观众投票"到底谁更决定排名（`feature_importance_analysis_real.py`、`judge_score_influence_analysis.py`、`audience_vote_influence_analysis.py`），附敏感性分析。
3. **验证模型可靠性**：验证模拟结果的一致性、确定性，算置信区间（`model_validation.py`）；对比不同排名算法对最终结果的影响（`rank_calculator.py`）。

## 文件结构

```
2026_MCM_Problem_C_Data.csv       官方数据集
code/
  2026mcm—c.py                    主模拟器（投票生成 + 淘汰验证）
  mcmc_simulation.py              蒙特卡洛模拟（可单独跑）
  feature_importance_analysis_real.py  特征重要性 + 敏感性分析
  judge_score_influence_analysis.py    评委打分影响分析
  audience_vote_influence_analysis.py  观众投票影响分析
  model_validation.py             模型一致性 / 确定性验证
  rank_calculator.py              排名算法对比
  debug_new_rule.py               假设规则检验（淘汰机制验证用）
analysis_results/                 每类分析的结果图与汇总表（中英文）
  flowcharts/                     各脚本的流程图说明
```

## 运行方式

```bash
python code/2026mcm—c.py        # 主模拟（注意 Windows 下冒号只会用英文，无影响）
```

代码里开了 `SIMULATION_MODE`，控制模拟规模和运行速度。图表输出默认带中文标注（`analysis_results` 里有英文版对照）。

## 一点体会

这个题最有意思的地方是"反向建模"——你不知道真实规则，只能从结果反推。模拟器和真实数据对得上的那一刻挺爽的。中间也踩了不少坑（比如模拟投票和真实淘汰对不齐，最后是靠调整投票生成的权重分布解决的），过程和思考都写在代码注释和流程图里了。
