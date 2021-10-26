import logo from './logo.svg';
import './App.css';
import { useState} from "react";
import StripeCheckout from "react-stripe-checkout";
import { FormControl, InputAdornment, InputLabel, OutlinedInput  } from "@mui/material";


function App() {
  const [ amount, setAmount ] = useState(0);

  const handleToken = (token) => {
    fetch("/payment/donate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, amount }),
    })
    .then(res => res.json())
    .then(_ => {
      window.alert("Transaction Successful.");
    }).catch(_ => window.alert("Transaction Failed."))
  }

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
  };
  
  return (
    <div className="App" 
    style={{
       display: 'flex', 
       justifyContent: 'center', 
       alignItems: 'center',
       width: '100%',
       height: "100vh",
       flexDirection: 'column',
       gap: 15,
       }}>
    <FormControl sx={{ m: 1 }}>
      <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
      <OutlinedInput
            id="outlined-adornment-amount"
            value={amount}
            onChange={handleAmountChange}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            label="Amount"
        />    
    </FormControl>
    <StripeCheckout
          stripeKey={process.env.REACT_APP_STRIPE_KEY || ""}
          token={handleToken}
          name=""
          panelLabel={`Donate`}
          currency="USD"
          amount={amount * 100}
      >
         
      </StripeCheckout>
</div>
  );
}

export default App;
