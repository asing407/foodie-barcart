import React, { useEffect, useState } from 'react';
import SuccessPage from './SuccessPage';

const ReceiptContainer = ({ transactionId }: { transactionId: string }) => {
    const [receiptData, setReceiptData] = useState(null);

    useEffect(() => {
        fetch(`/order-receipt/${transactionId}`)
            .then((res) => res.json())
            .then((data) => setReceiptData(data))
            .catch((err) => console.error('Failed to fetch receipt data:', err));
    }, [transactionId]);

    return receiptData ? (
        <SuccessPage
            transactionId={receiptData.transactionId}
            orderedItems={receiptData.orderedItems}
            totalAmount={receiptData.totalAmount}
        />
    ) : (
        <p>Loading receipt...</p>
    );
};

export default ReceiptContainer;
