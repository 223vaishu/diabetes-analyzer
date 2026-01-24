import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.ensemble import RandomForestClassifier
import joblib
import os


scaler = StandardScaler()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "..", "data")

df_old = pd.read_csv(os.path.join(DATA_DIR, "diabetes.csv"))
df_new = pd.read_csv(os.path.join(DATA_DIR, "pima_diabetes.csv"))

# print(df.head())
# print(df.info())
# print(df.describe())
# print(df.shape)



# cols_with_zero = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']

# df[cols_with_zero] = df[cols_with_zero].replace(0, np.nan)

# print(df.isna().sum())

# df['Outcome'].value_counts(normalize=True)

# cols_with_zero = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']

# for col in cols_with_zero:
#     df[col] = df[col].fillna(df[col].median())


# print(df.isna().sum())

# X = df.drop('Outcome', axis=1)
# y = df['Outcome']

# X_train, X_test, y_train, y_test = train_test_split(
#     X, y, test_size=0.2, random_state=42, stratify=y
# )

# X_train = scaler.fit_transform(X_train)
# X_test = scaler.transform(X_test)

# model = LogisticRegression(max_iter=1000)
# model.fit(X_train, y_train)


# y_pred = model.predict(X_test)

# rf = RandomForestClassifier(
#     n_estimators=200,
#     max_depth=6,
#     random_state=42,
#     class_weight='balanced'
# )

# rf.fit(X_train, y_train)

# rf_pred = rf.predict(X_test)
# feature_importance = pd.Series(
#     rf.feature_importances_,
#     index=X.columns
# ).sort_values(ascending=False)

# print(feature_importance)

# print("Accuracy:", accuracy_score(y_test, rf_pred))
# print(confusion_matrix(y_test, rf_pred))
# print(classification_report(y_test, rf_pred))

# joblib.dump(rf, "diabetes_model.pkl")
# joblib.dump(scaler, "scaler.pkl")

# cols_with_zero = [
#     'Glucose',
#     'BloodPressure',
#     'SkinThickness',
#     'Insulin',
#     'BMI'
# ]

# def clean_diabetes_data(df):
#     df = df.copy()
#     df[cols_with_zero] = df[cols_with_zero].replace(0, np.nan)
#     for col in cols_with_zero:
#         df[col] = df[col].fillna(df[col].median())
#     return df

# df_old = clean_diabetes_data(df_old)
# df_new = clean_diabetes_data(df_new)

df = pd.concat([df_old, df_new], ignore_index=True)

print("Final dataset shape:", df.shape)
print(df['Outcome'].value_counts(normalize=True))

X = df.drop("Outcome", axis=1)
y = df["Outcome"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=6,
    random_state=42,
    class_weight="balanced"
)

rf.fit(X_train_scaled, y_train)

rf_pred = rf.predict(X_test_scaled)

print("Accuracy:", accuracy_score(y_test, rf_pred))
print(confusion_matrix(y_test, rf_pred))
print(classification_report(y_test, rf_pred))