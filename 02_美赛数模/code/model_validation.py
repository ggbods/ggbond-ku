import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import os

class ModelValidator:
    
    def __init__(self, results_file='simulated_votes_results.csv'):
        self.results_file = results_file
        self.df = pd.read_csv(results_file)
        self.output_dir = 'charts/validation'
        os.makedirs(self.output_dir, exist_ok=True)
    
    def calculate_determinism_metrics(self):
        print("\n" + "=" * 60)
        print("Model Determinism Metrics")
        print("=" * 60)
        print("Calculating model determinism metrics, including basic statistics, coefficient of variation, confidence intervals, and entropy.")
        print("\nMetric descriptions:")
        print("- season: Season")
        print("- week: Week")
        print("- num_contestants: Number of contestants")
        print("- valid_simulations: Number of valid simulations")
        print("- mean_vote: Mean vote share")
        print("- std_vote: Standard deviation")
        print("- cv_vote: Coefficient of variation")
        print("- min_vote: Minimum vote share")
        print("- max_vote: Maximum vote share")
        print("- confidence_interval_lower: 95% confidence interval lower bound")
        print("- confidence_interval_upper: 95% confidence interval upper bound")
        print("- entropy: Entropy (measures uncertainty)")
        
        grouped = self.df.groupby(['season', 'week'])
        determinism_metrics = []
        
        for (season, week), group in grouped:
            vote_shares = group['simulated_vote_share']
            valid_simulations = group['num_valid_simulations'].iloc[0]
            
            if len(vote_shares) >= 2 and valid_simulations > 0:
                mean_vote = vote_shares.mean()
                std_vote = vote_shares.std()
                min_vote = vote_shares.min()
                max_vote = vote_shares.max()
                
                cv_vote = std_vote / mean_vote if mean_vote > 0 else 0
                
                confidence_interval = stats.t.interval(0.95, len(vote_shares)-1, 
                                                     loc=mean_vote, 
                                                     scale=stats.sem(vote_shares))
                
                entropy = -np.sum(vote_shares * np.log(vote_shares + 1e-10))
                
                determinism_metrics.append({
                    'season': season,
                    'week': week,
                    'num_contestants': len(vote_shares),
                    'valid_simulations': valid_simulations,
                    'mean_vote': mean_vote,
                    'std_vote': std_vote,
                    'cv_vote': cv_vote,
                    'min_vote': min_vote,
                    'max_vote': max_vote,
                    'confidence_interval_lower': confidence_interval[0],
                    'confidence_interval_upper': confidence_interval[1],
                    'entropy': entropy
                })
        
        metrics_df = pd.DataFrame(determinism_metrics)
        
        metrics_df.to_csv('model_determinism_metrics.csv', index=False, float_format='%.6f')
        metrics_df.to_excel('model_determinism_metrics.xlsx', index=False)
        print(f"\nDeterminism metrics results saved to model_determinism_metrics.csv and model_determinism_metrics.xlsx")
        
        print("\nFirst 10 rows of determinism metrics:")
        print(metrics_df.head(10).to_string(index=False))
        
        return metrics_df
    
    def perform_consistency_tests(self):
        print("\n" + "=" * 60)
        print("Model Consistency Tests")
        print("=" * 60)
        print("Performing model consistency tests to check if vote share distributions are consistent across different weeks.")
        print("\nTest methods:")
        print("- Kruskal-Wallis test: Non-parametric ANOVA to test if multiple independent samples come from the same distribution")
        print("- Mann-Whitney U test: Non-parametric test for pairwise comparison of samples")
        print("\nResult interpretation:")
        print("- p-value > 0.05: Consistency passed, no significant difference between distributions")
        print("- p-value <= 0.05: Consistency failed, significant difference between distributions")
        
        seasons = self.df['season'].unique()
        consistency_results = []
        
        for season in seasons:
            season_data = self.df[self.df['season'] == season]
            weeks = season_data['week'].unique()
            
            if len(weeks) >= 3:
                weekly_distributions = []
                week_labels = []
                
                for week in weeks:
                    week_data = season_data[season_data['week'] == week]
                    if len(week_data) >= 3:
                        weekly_distributions.append(week_data['simulated_vote_share'].values)
                        week_labels.append(f'Week {week}')
                
                if len(weekly_distributions) >= 3:
                    stat, p_value = stats.kruskal(*weekly_distributions)
                    
                    pairwise_results = []
                    for i in range(len(weekly_distributions)):
                        for j in range(i+1, len(weekly_distributions)):
                            u_stat, p_pair = stats.mannwhitneyu(weekly_distributions[i], 
                                                              weekly_distributions[j])
                            pairwise_results.append({
                                'week1': week_labels[i],
                                'week2': week_labels[j],
                                'u_stat': u_stat,
                                'p_value': p_pair
                            })
                    
                    consistency_results.append({
                        'season': season,
                        'num_weeks': len(weekly_distributions),
                        'kruskal_stat': stat,
                        'kruskal_p_value': p_value,
                        'is_consistent': p_value > 0.05,
                        'pairwise_tests': pairwise_results
                    })
        
        with open('model_consistency_tests.txt', 'w', encoding='utf-8') as f:
            f.write("模型一致性检验结果 (Model Consistency Test Results)\n")
            f.write("=" * 60 + "\n")
            
            for result in consistency_results:
                f.write(f"赛季 {result['season']} (周数: {result['num_weeks']}):\n")
                f.write(f"  Kruskal-Wallis统计量: {result['kruskal_stat']:.4f}\n")
                f.write(f"  p值: {result['kruskal_p_value']:.4f}\n")
                f.write(f"  一致性: {'通过' if result['is_consistent'] else '不通过'}\n")
                f.write("  两两比较结果 (Pairwise comparison results):\n")
                for pair in result['pairwise_tests']:
                    f.write(f"    {pair['week1']} vs {pair['week2']}: p值 = {pair['p_value']:.4f}\n")
                f.write("\n")
        
        if consistency_results:
            excel_data = []
            for result in consistency_results:
                excel_data.append({
                    'season': result['season'],
                    'num_weeks': result['num_weeks'],
                    'kruskal_stat': result['kruskal_stat'],
                    'kruskal_p_value': result['kruskal_p_value'],
                    'is_consistent': 'Passed' if result['is_consistent'] else 'Failed'
                })
            
            consistency_df = pd.DataFrame(excel_data)
            
            consistency_df.to_excel('model_consistency_tests.xlsx', index=False)
            print(f"\nConsistency test results saved to model_consistency_tests.txt and model_consistency_tests.xlsx")
        else:
            print(f"\nConsistency test results saved to model_consistency_tests.txt")
        
        print("\nFirst 5 seasons consistency test results:")
        for result in consistency_results[:5]:
            print(f"Season {result['season']}: Consistency {'Passed' if result['is_consistent'] else 'Failed'} (p-value: {result['kruskal_p_value']:.4f})")
        
        return consistency_results
    
    def generate_validation_charts(self, metrics_df, language='en'):
        print("\n" + "=" * 60)
        if language == 'en':
            print("Generating Validation Charts")
        else:
            print("生成验证图表")
        print("=" * 60)
        
        os.makedirs(self.output_dir, exist_ok=True)
        
        if not metrics_df.empty:
            top_seasons = metrics_df['season'].unique()[:20]
            heatmap_data = metrics_df[metrics_df['season'].isin(top_seasons)]
            
            pivot_data = heatmap_data.pivot(index='season', columns='week', values='cv_vote')
            
            plt.figure(figsize=(12, 8))
            sns.heatmap(pivot_data, annot=True, fmt=".2f", cmap="YlOrRd", 
                       cbar_kws={'label': 'Coefficient of Variation' if language == 'en' else '变异系数'})
            if language == 'en':
                plt.title('Heatmap of Vote Share Coefficient of Variation by Season and Week')
            else:
                plt.title('各赛季各周投票比例变异系数热力图')
            plt.tight_layout()
            suffix = '_eng' if language == 'en' else ''
            plt.savefig(os.path.join(self.output_dir, f'determinism_heatmap{suffix}.png'), dpi=150)
            plt.close()
            if language == 'en':
                print("Generated determinism heatmap")
            else:
                print("生成确定性度量热力图")
        
        if not metrics_df.empty:
            plt.figure(figsize=(10, 6))
            sns.histplot(metrics_df['entropy'], bins=20, kde=True)
            if language == 'en':
                plt.title('Entropy Distribution Histogram (Uncertainty Measure)')
                plt.xlabel('Entropy')
                plt.ylabel('Frequency')
            else:
                plt.title('熵值分布直方图（不确定性度量）')
                plt.xlabel('熵值')
                plt.ylabel('频率')
            plt.grid(axis='y', alpha=0.3)
            plt.tight_layout()
            suffix = '_eng' if language == 'en' else ''
            plt.savefig(os.path.join(self.output_dir, f'entropy_distribution{suffix}.png'), dpi=150)
            plt.close()
            if language == 'en':
                print("Generated entropy distribution histogram")
            else:
                print("生成熵值分布直方图")
        
        if not metrics_df.empty:
            plt.figure(figsize=(10, 6))
            sns.scatterplot(x='valid_simulations', y='std_vote', data=metrics_df, 
                          hue='num_contestants', size='num_contestants', 
                          sizes=(20, 200), alpha=0.7)
            if language == 'en':
                plt.title('Relationship Between Valid Simulations and Vote Share Standard Deviation')
                plt.xlabel('Valid Simulations')
                plt.ylabel('Vote Share Standard Deviation')
            else:
                plt.title('有效模拟次数与投票比例标准差的关系')
                plt.xlabel('有效模拟次数')
                plt.ylabel('投票比例标准差')
            plt.xscale('log')
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            suffix = '_eng' if language == 'en' else ''
            plt.savefig(os.path.join(self.output_dir, f'simulations_vs_std{suffix}.png'), dpi=150)
            plt.close()
            if language == 'en':
                print("Generated simulations vs standard deviation scatter plot")
            else:
                print("生成模拟次数与标准差关系图")
        
        if not metrics_df.empty:
            sample_data = metrics_df.head(10)
            
            plt.figure(figsize=(12, 6))
            plt.errorbar(range(len(sample_data)), sample_data['mean_vote'], 
                        yerr=[sample_data['mean_vote'] - sample_data['confidence_interval_lower'], 
                              sample_data['confidence_interval_upper'] - sample_data['mean_vote']],
                        fmt='o', capsize=5)
            plt.xticks(range(len(sample_data)), 
                      [f"S{row['season']}W{row['week']}" for _, row in sample_data.iterrows()],
                      rotation=45)
            if language == 'en':
                plt.title('Mean Vote Share with 95% Confidence Intervals')
                plt.ylabel('Mean Vote Share')
            else:
                plt.title('平均投票比例与95%置信区间')
                plt.ylabel('平均投票比例')
            plt.grid(axis='y', alpha=0.3)
            plt.tight_layout()
            suffix = '_eng' if language == 'en' else ''
            plt.savefig(os.path.join(self.output_dir, f'confidence_intervals{suffix}.png'), dpi=150)
            plt.close()
            if language == 'en':
                print("Generated confidence intervals visualization")
            else:
                print("生成置信区间可视化图")
    
    def sensitivity_analysis_validation(self, metrics_df):
        print("\n" + "=" * 60)
        print("Validation Sensitivity Analysis")
        print("=" * 60)
        print("Analyzing sensitivity of validation metrics to different parameters.")
        
        print("\n1. Analyzing impact of number of contestants on determinism metrics:")
        
        grouped_by_contestants = metrics_df.groupby('num_contestants').agg({
            'cv_vote': 'mean',
            'std_vote': 'mean',
            'entropy': 'mean',
            'valid_simulations': 'mean'
        }).reset_index()
        
        print("\nImpact of Number of Contestants:")
        print("{:<20} {:<15} {:<15} {:<15} {:<15}".format(
            'Num Contestants', 'Mean CV', 'Mean Std', 'Mean Entropy', 'Mean Valid Sims'
        ))
        print("-" * 80)
        
        for _, row in grouped_by_contestants.iterrows():
            print("{:<20} {:<15.4f} {:<15.4f} {:<15.4f} {:<15.0f}".format(
                int(row['num_contestants']),
                row['cv_vote'],
                row['std_vote'],
                row['entropy'],
                row['valid_simulations']
            ))
        
        plt.figure(figsize=(12, 8))
        
        plt.subplot(2, 2, 1)
        plt.plot(grouped_by_contestants['num_contestants'], grouped_by_contestants['cv_vote'], 'o-')
        plt.title('Impact of Number of Contestants on CV')
        plt.xlabel('Number of Contestants')
        plt.ylabel('Coefficient of Variation')
        plt.grid(alpha=0.3)
        
        plt.subplot(2, 2, 2)
        plt.plot(grouped_by_contestants['num_contestants'], grouped_by_contestants['std_vote'], 'o-')
        plt.title('Impact of Number of Contestants on Std Dev')
        plt.xlabel('Number of Contestants')
        plt.ylabel('Standard Deviation')
        plt.grid(alpha=0.3)
        
        plt.subplot(2, 2, 3)
        plt.plot(grouped_by_contestants['num_contestants'], grouped_by_contestants['entropy'], 'o-')
        plt.title('Impact of Number of Contestants on Entropy')
        plt.xlabel('Number of Contestants')
        plt.ylabel('Entropy')
        plt.grid(alpha=0.3)
        
        plt.subplot(2, 2, 4)
        plt.plot(grouped_by_contestants['num_contestants'], grouped_by_contestants['valid_simulations'], 'o-')
        plt.title('Impact of Number of Contestants on Valid Sims')
        plt.xlabel('Number of Contestants')
        plt.ylabel('Valid Simulations')
        plt.grid(alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, 'sensitivity_analysis_contestants_eng.png'), dpi=150)
        plt.close()
        
        plt.figure(figsize=(12, 8))
        
        plt.subplot(2, 2, 1)
        plt.plot(grouped_by_contestants['num_contestants'], grouped_by_contestants['cv_vote'], 'o-')
        plt.title('选手数量对变异系数的影响')
        plt.xlabel('选手数量')
        plt.ylabel('变异系数')
        plt.grid(alpha=0.3)
        
        plt.subplot(2, 2, 2)
        plt.plot(grouped_by_contestants['num_contestants'], grouped_by_contestants['std_vote'], 'o-')
        plt.title('选手数量对标准差的影响')
        plt.xlabel('选手数量')
        plt.ylabel('标准差')
        plt.grid(alpha=0.3)
        
        plt.subplot(2, 2, 3)
        plt.plot(grouped_by_contestants['num_contestants'], grouped_by_contestants['entropy'], 'o-')
        plt.title('选手数量对熵值的影响')
        plt.xlabel('选手数量')
        plt.ylabel('熵值')
        plt.grid(alpha=0.3)
        
        plt.subplot(2, 2, 4)
        plt.plot(grouped_by_contestants['num_contestants'], grouped_by_contestants['valid_simulations'], 'o-')
        plt.title('选手数量对有效模拟次数的影响')
        plt.xlabel('选手数量')
        plt.ylabel('有效模拟次数')
        plt.grid(alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, 'sensitivity_analysis_contestants.png'), dpi=150)
        plt.close()
        
        print("\nSensitivity analysis charts saved as:")
        print("1. sensitivity_analysis_contestants_eng.png")
        print("2. sensitivity_analysis_contestants.png")
        
        return grouped_by_contestants
    
    def run_all_validations(self):
        print("Starting model validation...")
        
        metrics_df = self.calculate_determinism_metrics()
        
        consistency_results = self.perform_consistency_tests()
        
        if not metrics_df.empty:
            self.generate_validation_charts(metrics_df, language='en')
        
        if not metrics_df.empty:
            self.generate_validation_charts(metrics_df, language='zh')
        
        if not metrics_df.empty:
            self.sensitivity_analysis_validation(metrics_df)
        
        print("\nModel validation completed!")
        print("Generated files:")
        print("1. model_determinism_metrics.csv - Determinism metrics results")
        print("2. model_consistency_tests.txt - Consistency test results")
        print("3. charts/validation/ - Validation charts (English and Chinese)")
        print("4. charts/validation/sensitivity_analysis_*.png - Sensitivity analysis charts")

if __name__ == "__main__":
    print("=" * 60)
    print("Model Determinism Metrics and Consistency Tests")
    print("=" * 60)
    
    validator = ModelValidator()
    
    validator.run_all_validations()