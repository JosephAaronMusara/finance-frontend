import { createSlice } from "@reduxjs/toolkit";
import axios from 'axios';

const dataSlice = createSlice({
  name: "data",
  initialState: {
    accountReceivable: [], 
    bankBalances: [], 
    expenses: [],
    rates: [],
 
  },
  reducers: {
    setAccountReceivable: (state, action) => {
      state.accountReceivable = action.payload;
    },
    setBankBalances: (state, action) => {
      state.bankBalances = action.payload;
    },

    setExpenses: (state, action) => {
      state.expenses = action.payload;
    },

    setRates: (state,action) => {
      state.rates = action.payload;
    }
  
  },
});

export const fetchAccountReceivable = () => async (dispatch) => {
  try {
    
    const response = await axios.get(
      "http://127.0.0.1:8000/api/accountreceivable/"
    );

    dispatch(setAccountReceivable(response.data));
    
    
  } catch (error) {
    console.log("Axios error:", error.message);
  }
};
export const fetchBankBalances = () => async (dispatch) => {
  try {
    
    const response = await axios.get(
      "http://127.0.0.1:8000/api/bankbalance/"
    );

    dispatch(setBankBalances(response.data));

    
    
  } catch (error) {
    console.log("Axios error:", error.message);
  }
};

export const fetchExpenses = () => async (dispatch) => {
  try {
    
    const response = await axios.get(
      "http://127.0.0.1:8000/api/expense/"
    );
   
    dispatch(setExpenses(response.data));

    
    
  } catch (error) {
    console.log("Axios error:", error.message);
  }
};

export const fetchRates = () => async (dispatch) => {
  try {
    
    const response = await axios.get(
      "http://127.0.0.1:8000/api/currency/"
    );
    console.log(response,"reate____")

    dispatch(setRates(response.data));

    
    
  } catch (error) {
    console.log("Axios error:", error.message);
  }
};



export const {
  setAccountReceivable,
setBankBalances, setExpenses,
setRates

} = dataSlice.actions;

export default dataSlice.reducer;
