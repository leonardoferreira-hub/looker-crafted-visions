import pandas as pd
import streamlit as st

SHEET_ID = "1QlDrtv5oPXYH9LsS7GhvvGsSUlSwWDykzVurp7rUAms"
SHEET_GID = "41860490"
CSV_URL = f"https://docs.google.com/spreadsheets/d/1QlDrtv5oPXYH9LsS7GhvvGsSUlSwWDykzVurp7rUAms/export?format=csv&gid=41860490"

@st.cache_data
def load_data() -> pd.DataFrame:
    """Load data from the Google Sheets CSV export."""
    return pd.read_csv(CSV_URL)

def main() -> None:
    st.set_page_config(page_title="Travessia Dashboard", layout="wide")
    st.title("Travessia Dashboard")

    try:
        df = load_data()
    except Exception as e:
        st.error(f"Erro ao carregar dados: {e}")
        return

    st.subheader("Base de dados")
    st.dataframe(df)

    st.subheader("Indicadores")
    st.metric("Total de operações", len(df))

    if "Categoria" in df.columns:
        st.bar_chart(df["Categoria"].value_counts())

    if {"Categoria", "Estruturação"}.issubset(df.columns):
        numeric = pd.to_numeric(df["Estruturação"], errors="coerce")
        st.subheader("Estruturação por categoria")
        st.bar_chart(df.groupby("Categoria")[numeric.name].sum())

if __name__ == "__main__":
    main()