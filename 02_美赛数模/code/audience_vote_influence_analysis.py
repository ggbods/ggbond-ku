import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

def load_data():
    rank_data_path = 'rank_results_20260201_192654.csv'
    print(f"Reading ranking result file: {rank_data_path}")
    rank_df = pd.read_csv(rank_data_path)
    
    original_data_path = '2026_MCM_Problem_C_Data.csv'
    print(f"Reading original data file: {original_data_path}")
    original_df = pd.read_csv(original_data_path)
    
    return rank_df, original_df

def preprocess_data(rank_df, original_df):
    features_df = original_df[['celebrity_name', 'celebrity_age_during_season', 'celebrity_homecountry/region', 'celebrity_industry']].copy()
    
    vote_data = rank_df[['celebrity_name', 'simulated_vote_share', 'avg_judge_score']].copy()
    
    merged_df = pd.merge(features_df, vote_data, on='celebrity_name', how='inner')
    
    merged_df = merged_df.dropna()
    
    merged_df = merged_df[merged_df['simulated_vote_share'] > 0]
    
    return merged_df

def encode_categorical_features(df):
    X = df[['avg_judge_score', 'celebrity_age_during_season', 'celebrity_homecountry/region', 'celebrity_industry']].copy()
    y = df['simulated_vote_share'].copy()
    
    country_encoder = LabelEncoder()
    X['country_encoded'] = country_encoder.fit_transform(X['celebrity_homecountry/region'].astype(str))
    
    industry_encoder = LabelEncoder()
    X['industry_encoded'] = industry_encoder.fit_transform(X['celebrity_industry'].astype(str))
    
    X = X.drop(['celebrity_homecountry/region', 'celebrity_industry'], axis=1)
    
    numerical_features = ['avg_judge_score', 'celebrity_age_during_season']
    scaler = StandardScaler()
    X[numerical_features] = scaler.fit_transform(X[numerical_features])
    
    return X, y

def train_random_forest(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    rf_model = RandomForestRegressor(
        n_estimators=500,
        max_depth=8,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    rf_model.fit(X_train, y_train)
    
    y_pred = rf_model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Model evaluation results:")
    print(f"Mean Squared Error (MSE): {mse:.4f}")
    print(f"R² Score: {r2:.4f}")
    
    return rf_model, X_train, X_test, y_train, y_test, y_pred

def analyze_feature_importance(model, X):
    feature_importance = model.feature_importances_
    
    feature_importance_df = pd.DataFrame({
        'feature': X.columns,
        'importance': feature_importance
    })
    
    feature_importance_df['feature'] = feature_importance_df['feature'].replace({
        'avg_judge_score': 'Judge Score',
        'celebrity_age_during_season': 'Age During Season',
        'country_encoded': 'Country/Region',
        'industry_encoded': 'Industry'
    })
    
    feature_importance_df['importance_percent'] = feature_importance_df['importance'] / feature_importance_df['importance'].sum() * 100
    
    feature_importance_df = feature_importance_df.sort_values('importance', ascending=False)
    
    print("\nFeature importance analysis:")
    print(feature_importance_df)
    
    return feature_importance_df

def visualize_feature_importance(feature_importance_df, title, filename_suffix):
    plt.figure(figsize=(12, 8))
    sns.barplot(x='importance_percent', y='feature', data=feature_importance_df)
    plt.title(title, fontsize=16)
    plt.xlabel('Importance (%)', fontsize=14)
    plt.ylabel('Feature', fontsize=14)
    plt.tick_params(axis='both', labelsize=12)
    plt.grid(axis='x', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(f'audience_vote_influence_{filename_suffix}.png', dpi=150)
    plt.show()
    
    print(f"\nFeature importance chart saved as audience_vote_influence_{filename_suffix}.png")

def sensitivity_analysis_feature(model, X, y):
    print("\nPerforming feature sensitivity analysis...")
    
    X_copy = X.copy()
    
    original_predictions = model.predict(X_copy)
    
    baseline_mse = mean_squared_error(y, original_predictions)
    baseline_r2 = r2_score(y, original_predictions)
    
    print(f"Baseline MSE: {baseline_mse:.4f}")
    print(f"Baseline R²: {baseline_r2:.4f}")
    
    sensitivity_results = []
    
    for feature in X.columns:
        X_perturbed = X_copy.copy()
        
        feature_mean = X_perturbed[feature].mean()
        feature_std = X_perturbed[feature].std()
        
        perturbations = [-0.1, 0.1]
        
        for perturbation in perturbations:
            if feature_std > 0:
                X_perturbed[feature] = X_copy[feature] + (perturbation * feature_std)
            else:
                X_perturbed[feature] = X_copy[feature] * (1 + perturbation)
            
            perturbed_predictions = model.predict(X_perturbed)
            
            perturbed_mse = mean_squared_error(y, perturbed_predictions)
            perturbed_r2 = r2_score(y, perturbed_predictions)
            
            mse_change = ((perturbed_mse - baseline_mse) / baseline_mse) * 100
            r2_change = ((perturbed_r2 - baseline_r2) / baseline_r2) * 100
            
            prediction_change = np.mean(np.abs((perturbed_predictions - original_predictions) / original_predictions)) * 100
            
            sensitivity_results.append({
                'feature': feature,
                'perturbation': perturbation * 100,
                'mse_change': mse_change,
                'r2_change': r2_change,
                'prediction_change': prediction_change
            })
    
    sensitivity_df = pd.DataFrame(sensitivity_results)
    
    sensitivity_df['feature'] = sensitivity_df['feature'].replace({
        'avg_judge_score': 'Judge Score',
        'celebrity_age_during_season': 'Age During Season',
        'country_encoded': 'Country/Region',
        'industry_encoded': 'Industry'
    })
    
    print("\nFeature sensitivity analysis results:")
    print(sensitivity_df)
    
    return sensitivity_df

def sensitivity_analysis_parameters(X, y):
    print("\nPerforming model parameter sensitivity analysis...")
    
    param_grid = {
        'n_estimators': [100, 300, 500, 700],
        'max_depth': [4, 6, 8, 10],
        'min_samples_split': [2, 4, 6],
        'min_samples_leaf': [1, 2, 3]
    }
    
    param_results = []
    
    for param_name, param_values in param_grid.items():
        for param_value in param_values:
            params = {
                'n_estimators': 500,
                'max_depth': 8,
                'min_samples_split': 4,
                'min_samples_leaf': 2,
                'random_state': 42,
                'n_jobs': -1
            }
            
            params[param_name] = param_value
            
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            model = RandomForestRegressor(**params)
            model.fit(X_train, y_train)
            
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            param_results.append({
                'parameter': param_name,
                'value': param_value,
                'mse': mse,
                'r2': r2
            })
    
    param_df = pd.DataFrame(param_results)
    
    print("\nModel parameter sensitivity analysis results:")
    print(param_df)
    
    return param_df

def visualize_sensitivity_analysis(sensitivity_df, title, filename_suffix):
    plt.figure(figsize=(14, 10))
    
    sns.barplot(x='feature', y='prediction_change', hue='perturbation', data=sensitivity_df)
    plt.title(title, fontsize=16)
    plt.xlabel('Feature', fontsize=14)
    plt.ylabel('Prediction Change (%)', fontsize=14)
    plt.tick_params(axis='both', labelsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.grid(axis='y', alpha=0.3)
    plt.legend(title='Perturbation (%)')
    
    plt.tight_layout()
    plt.savefig(f'sensitivity_analysis_{filename_suffix}.png', dpi=150)
    plt.show()
    
    print(f"\nSensitivity analysis chart saved as sensitivity_analysis_{filename_suffix}.png")

def visualize_parameter_sensitivity(param_df, title, filename_suffix):
    plt.figure(figsize=(14, 10))
    
    parameters = param_df['parameter'].unique()
    num_params = len(parameters)
    
    for i, param in enumerate(parameters, 1):
        plt.subplot(num_params, 1, i)
        param_data = param_df[param_df['parameter'] == param]
        sns.lineplot(x='value', y='r2', data=param_data, marker='o')
        plt.title(f'{param} Sensitivity', fontsize=14)
        plt.xlabel(f'{param} Value', fontsize=12)
        plt.ylabel('R² Score', fontsize=12)
        plt.grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(f'parameter_sensitivity_{filename_suffix}.png', dpi=150)
    plt.show()
    
    print(f"\nParameter sensitivity chart saved as parameter_sensitivity_{filename_suffix}.png")

def main():
    print("Starting analysis of factors influencing audience votes...")
    
    rank_df, original_df = load_data()
    
    merged_df = preprocess_data(rank_df, original_df)
    
    print(f"\nMerged data size: {len(merged_df)} records")
    print(f"Data sample:")
    print(merged_df.head())
    
    X, y = encode_categorical_features(merged_df)
    
    print(f"\nEncoded features:")
    print(X.head())
    
    rf_model, X_train, X_test, y_train, y_test, y_pred = train_random_forest(X, y)
    
    feature_importance_df = analyze_feature_importance(rf_model, X)
    
    visualize_feature_importance(feature_importance_df, 'Feature Influence on Audience Votes (%)', 'eng')
    
    visualize_feature_importance(feature_importance_df, '观众投票影响因素分析 (%)', '')
    
    sensitivity_df = sensitivity_analysis_feature(rf_model, X, y)
    
    visualize_sensitivity_analysis(sensitivity_df, 'Feature Sensitivity Analysis', 'eng')
    
    visualize_sensitivity_analysis(sensitivity_df, '特征敏感性分析', '')
    
    param_df = sensitivity_analysis_parameters(X, y)
    
    visualize_parameter_sensitivity(param_df, 'Model Parameter Sensitivity Analysis', 'eng')
    
    visualize_parameter_sensitivity(param_df, '模型参数敏感性分析', '')
    
    feature_importance_df.to_csv('audience_vote_influence_results.csv', index=False)
    print("\nFeature importance results saved as audience_vote_influence_results.csv")
    
    sensitivity_df.to_csv('audience_vote_sensitivity_results.csv', index=False)
    print("Sensitivity analysis results saved as audience_vote_sensitivity_results.csv")
    
    param_df.to_csv('audience_vote_parameter_sensitivity_results.csv', index=False)
    print("Parameter sensitivity analysis results saved as audience_vote_parameter_sensitivity_results.csv")
    
    merged_df.to_csv('audience_vote_analysis_data.csv', index=False)
    print("Merged data saved as audience_vote_analysis_data.csv")

if __name__ == "__main__":
    main()
