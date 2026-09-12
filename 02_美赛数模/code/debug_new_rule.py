print("测试基本导入...")
try:
    import pandas as pd
    import numpy as np
    import os
    import glob
    import matplotlib.pyplot as plt
    import seaborn as sns
    print("✓ 成功导入基本库")
except Exception as e:
    print(f"✗ 导入失败: {e}")
    import traceback
    traceback.print_exc()

print("\n测试计算排名的函数...")
try:
    def calculate_ranks(values, ascending=False):
        sorted_indices = np.argsort(values)[::-1] if not ascending else np.argsort(values)
        ranks = [0] * len(values)
        for rank, idx in enumerate(sorted_indices, 1):
            ranks[idx] = rank
        return ranks
    print("✓ 成功定义 calculate_ranks 函数")
except Exception as e:
    print(f"✗ 定义函数失败: {e}")
    import traceback
    traceback.print_exc()

print("\n测试加载数据的函数...")
try:
    def load_data():
        rank_data_path = 'rank_results_20260201_192654.csv'
        if not os.path.exists(rank_data_path):
            result_files = glob.glob('rank_results_*.csv')
            if not result_files:
                print("错误：找不到排名结果文件")
                return None, None
            result_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
            rank_data_path = result_files[0]
        
        print(f"读取排名结果文件: {rank_data_path}")
        rank_df = pd.read_csv(rank_data_path)
        
        original_data_path = '2026_MCM_Problem_C_Data.csv'
        if not os.path.exists(original_data_path):
            print("错误：找不到原始数据文件")
            return None, None
        
        print(f"读取原始数据文件: {original_data_path}")
        original_df = pd.read_csv(original_data_path)
        
        return rank_df, original_df
    print("✓ 成功定义 load_data 函数")
except Exception as e:
    print(f"✗ 定义函数失败: {e}")
    import traceback
    traceback.print_exc()

print("\n测试获取周数据的函数...")
try:
    def get_week_data(rank_df, original_df, season, week):
        season_celebrities = original_df[original_df['season'] == season]['celebrity_name'].unique()
        
        week_data = rank_df[(rank_df['season'] == season) & (rank_df['week'] == week)].copy()
        
        contestant_dict = {}
        if not week_data.empty:
            for idx, row in week_data.iterrows():
                contestant_dict[row['celebrity_name']] = {
                    'avg_score': row['avg_judge_score'],
                    'vote_share': row['simulated_vote_share']
                }
        
        contestants = []
        for celebrity in season_celebrities:
            if celebrity in contestant_dict:
                contestant_info = {
                    'name': celebrity,
                    'avg_score': contestant_dict[celebrity]['avg_score'],
                    'vote_share': contestant_dict[celebrity]['vote_share'],
                    'season': season,
                    'week': week
                }
            else:
                contestant_info = {
                    'name': celebrity,
                    'avg_score': 0.0,
                    'vote_share': 0.0,
                    'season': season,
                    'week': week
                }
            
            contestants.append(contestant_info)
        
        return contestants
    print("✓ 成功定义 get_week_data 函数")
except Exception as e:
    print(f"✗ 定义函数失败: {e}")
    import traceback
    traceback.print_exc()

print("\n测试模拟淘汰的函数...")
try:
    def simulate_elimination(contestants):
        if len(contestants) < 2:
            return None
        
        avg_scores = [c['avg_score'] for c in contestants]
        judge_ranks = calculate_ranks(avg_scores, ascending=False)
        
        vote_shares = [c['vote_share'] for c in contestants]
        vote_ranks = calculate_ranks(vote_shares, ascending=False)
        
        combined_ranks = [judge_ranks[i] + vote_ranks[i] for i in range(len(judge_ranks))]
        combined_rank_indices = np.argsort(combined_ranks)[::-1]
        
        bottom_two_indices = combined_rank_indices[-2:]
        bottom_two = [contestants[i] for i in bottom_two_indices]
        
        elimination_scenarios = []
        
        judge_bottom_idx = np.argmin([c['avg_score'] for c in bottom_two])
        elimination_scenarios.append({
            'scenario': '评委评分低的淘汰',
            'eliminated': bottom_two[judge_bottom_idx],
            'reason': '评委评分低',
            'score': bottom_two[judge_bottom_idx]['avg_score'],
            'remaining': [c for i, c in enumerate(bottom_two) if i != judge_bottom_idx]
        })
        
        vote_bottom_idx = np.argmin([c['vote_share'] for c in bottom_two])
        elimination_scenarios.append({
            'scenario': '粉丝投票低的淘汰',
            'eliminated': bottom_two[vote_bottom_idx],
            'reason': '粉丝投票低',
            'score': bottom_two[vote_bottom_idx]['vote_share'],
            'remaining': [c for i, c in enumerate(bottom_two) if i != vote_bottom_idx]
        })
        
        return elimination_scenarios
    print("✓ 成功定义 simulate_elimination 函数")
except Exception as e:
    print(f"✗ 定义函数失败: {e}")
    import traceback
    traceback.print_exc()

print("\n测试获取原始淘汰周的函数...")
try:
    def get_original_elimination_week(original_df, season, celebrity_name):
        celebrity_row = original_df[(original_df['season'] == season) & (original_df['celebrity_name'] == celebrity_name)]
        if celebrity_row.empty:
            return None
        
        result = celebrity_row['results'].iloc[0]
        if isinstance(result, str):
            if 'Eliminated' in result or '淘汰' in result:
                import re
                week_match = re.search(r'\b(\d+)\b', result)
                if week_match:
                    return int(week_match.group(1))
        
        return None
    print("✓ 成功定义 get_original_elimination_week 函数")
except Exception as e:
    print(f"✗ 定义函数失败: {e}")
    import traceback
    traceback.print_exc()

print("\n测试敏感性分析函数...")
try:
    def sensitivity_analysis_elimination(contestants):
        if len(contestants) < 2:
            return []
        
        weight_combinations = [(0.1, 0.9), (0.3, 0.7), (0.5, 0.5), (0.7, 0.3), (0.9, 0.1)]
        
        sensitivity_results = []
        
        for judge_weight, vote_weight in weight_combinations:
            avg_scores = [c['avg_score'] for c in contestants]
            vote_shares = [c['vote_share'] for c in contestants]
            
            judge_ranks = calculate_ranks(avg_scores, ascending=False)
            vote_ranks = calculate_ranks(vote_shares, ascending=False)
            
            weighted_ranks = [judge_weight * judge_ranks[i] + vote_weight * vote_ranks[i] 
                             for i in range(len(judge_ranks))]
            
            weighted_rank_indices = np.argsort(weighted_ranks)[::-1]
            bottom_two_indices = weighted_rank_indices[-2:]
            bottom_two = [contestants[i] for i in bottom_two_indices]
            
            judge_bottom_idx = np.argmin([c['avg_score'] for c in bottom_two])
            vote_bottom_idx = np.argmin([c['vote_share'] for c in bottom_two])
            
            sensitivity_results.append({
                'judge_weight': judge_weight,
                'vote_weight': vote_weight,
                'bottom_two': bottom_two,
                'eliminated_by_judge': bottom_two[judge_bottom_idx],
                'eliminated_by_vote': bottom_two[vote_bottom_idx],
                'consistent_elimination': bottom_two[judge_bottom_idx]['name'] == bottom_two[vote_bottom_idx]['name']
            })
        
        return sensitivity_results
    print("✓ 成功定义 sensitivity_analysis_elimination 函数")
except Exception as e:
    print(f"✗ 定义函数失败: {e}")
    import traceback
    traceback.print_exc()

print("\n测试可视化函数...")
try:
    def visualize_sensitivity_analysis(sensitivity_results, language='eng'):
        if not sensitivity_results:
            return
        
        output_dir = 'analysis_results/debug_new_rule'
        os.makedirs(output_dir, exist_ok=True)
        
        results_data = []
        for result in sensitivity_results:
            judge_weight = result['judge_weight']
            vote_weight = result['vote_weight']
            eliminated_by_judge = result['eliminated_by_judge']['name']
            eliminated_by_vote = result['eliminated_by_vote']['name']
            consistent = result['consistent_elimination']
            
            results_data.append({
                'judge_weight': judge_weight,
                'vote_weight': vote_weight,
                'eliminated_by_judge': eliminated_by_judge,
                'eliminated_by_vote': eliminated_by_vote,
                'consistent': consistent
            })
        
        results_df = pd.DataFrame(results_data)
        
        plt.figure(figsize=(12, 8))
        consistent_counts = results_df['consistent'].value_counts()
        
        if language == 'eng':
            plt.bar(['Consistent', 'Inconsistent'], consistent_counts.values, color=['green', 'red'])
            plt.title('Consistency of Elimination Decisions')
            plt.xlabel('Decision Consistency')
            plt.ylabel('Count')
        else:
            plt.bar(['一致', '不一致'], consistent_counts.values, color=['green', 'red'])
            plt.title('淘汰决定的一致性')
            plt.xlabel('决定一致性')
            plt.ylabel('数量')
        
        plt.grid(True, alpha=0.3)
        
        suffix = '_eng' if language == 'eng' else ''
        filename = f'elimination_consistency{suffix}.png'
        filepath = os.path.join(output_dir, filename)
        plt.savefig(filepath, dpi=150, bbox_inches='tight')
        plt.close()
        
        plt.figure(figsize=(12, 8))
        
        judge_eliminated = results_df['eliminated_by_judge'].value_counts()
        vote_eliminated = results_df['eliminated_by_vote'].value_counts()
        
        combined_df = pd.DataFrame({
            'Eliminated by Judge Score': judge_eliminated,
            'Eliminated by Vote Share': vote_eliminated
        }).fillna(0)
        
        combined_df.plot(kind='bar', figsize=(12, 8))
        
        if language == 'eng':
            plt.title('Elimination Decisions Under Different Weight Combinations')
            plt.xlabel('Contestant')
            plt.ylabel('Number of Times Eliminated')
        else:
            plt.title('不同权重组合下的淘汰决定')
            plt.xlabel('选手')
            plt.ylabel('被淘汰次数')
        
        plt.grid(True, alpha=0.3)
        plt.xticks(rotation=45, ha='right')
        
        filename = f'elimination_decisions{suffix}.png'
        filepath = os.path.join(output_dir, filename)
        plt.savefig(filepath, dpi=150, bbox_inches='tight')
        plt.close()
        
        print(f"✓ 成功生成敏感性分析图表: {filename}")
    print("✓ 成功定义 visualize_sensitivity_analysis 函数")
except Exception as e:
    print(f"✗ 定义函数失败: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("运行完整测试并执行敏感性分析")
print("=" * 60)

try:
    rank_df, original_df = load_data()
    
    if rank_df is not None and original_df is not None:
        sample_season = rank_df['season'].iloc[0]
        sample_week = rank_df[rank_df['season'] == sample_season]['week'].iloc[0]
        
        print(f"\n分析赛季 {sample_season}, 第 {sample_week} 周的数据...")
        
        contestants = get_week_data(rank_df, original_df, sample_season, sample_week)
        
        if contestants:
            print(f"成功获取 {len(contestants)} 位选手的数据")
            
            sensitivity_results = sensitivity_analysis_elimination(contestants)
            
            if sensitivity_results:
                print("\n敏感性分析结果:")
                for i, result in enumerate(sensitivity_results):
                    print(f"\n场景 {i+1}: 评委权重 = {result['judge_weight']}, 投票权重 = {result['vote_weight']}")
                    print(f"  末两位选手: {[c['name'] for c in result['bottom_two']]}")
                    print(f"  按评委评分淘汰: {result['eliminated_by_judge']['name']}")
                    print(f"  按粉丝投票淘汰: {result['eliminated_by_vote']['name']}")
                    print(f"  决定是否一致: {'是' if result['consistent_elimination'] else '否'}")
                
                print("\n生成英文敏感性分析图表...")
                visualize_sensitivity_analysis(sensitivity_results, language='eng')
                
                print("\n生成中文敏感性分析图表...")
                visualize_sensitivity_analysis(sensitivity_results, language='cn')
            else:
                print("无法执行敏感性分析，选手数据不足")
        else:
            print("无法获取选手数据")
    else:
        print("无法加载数据")
except Exception as e:
    print(f"执行测试时出错: {e}")
    import traceback
    traceback.print_exc()

print("\n调试完成！")