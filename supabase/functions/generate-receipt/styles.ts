export const receiptStyles = `
  body { 
    font-family: Arial, sans-serif; 
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  .header { 
    text-align: center; 
    margin-bottom: 30px;
    border-bottom: 2px solid #eee;
    padding-bottom: 20px;
  }
  .restaurant-info {
    margin-bottom: 30px;
    text-align: center;
    color: #666;
  }
  .items { 
    margin: 20px 0;
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
  }
  .item {
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
    padding: 5px 0;
  }
  .item-details {
    flex: 1;
  }
  .item-price {
    text-align: right;
    min-width: 80px;
  }
  .totals {
    margin-top: 20px;
    text-align: right;
  }
  .total-row {
    display: flex;
    justify-content: flex-end;
    margin: 5px 0;
  }
  .total-label {
    margin-right: 20px;
  }
  .grand-total {
    font-size: 1.2em;
    font-weight: bold;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 2px solid #eee;
  }
  .payment-info {
    margin-top: 30px;
    text-align: center;
    padding: 20px;
    border-radius: 8px;
  }
  .order-info {
    margin-top: 30px;
    text-align: center;
    padding: 20px;
    background-color: #f7f7f7;
    border-radius: 8px;
  }
  .footer {
    margin-top: 40px;
    text-align: center;
    color: #666;
    font-size: 0.9em;
  }
`;