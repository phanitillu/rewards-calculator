import React, { useState, useEffect } from "react";
import fetch from './api/dataSet';
import ReactTable from 'react-table';
import "./App.css";
import _ from 'lodash';

function calculateResult(incomingData) {
  // Calculate points per transaction

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const transactionPoints = incomingData.map(transaction => {
    let points = 0;
    let over100 = transaction.amount - 100;

    if (over100 > 0) {
      // A customer receives 2 points for every dollar spent over $100 in each transaction      
      points += (over100 * 2);
    }
    if (transaction.amount > 50) {
      // plus 1 point for every dollar spent over $50 in each transaction
      points += 50;
    }
    const month = new Date(transaction.date).getMonth();
    return { ...transaction, points, month };
  });

  let customer = {};
  let customerTotalPoints = {};
  transactionPoints.forEach(transactionPoints => {
    let { customerId, name, month, points } = transactionPoints;
    if (!customer[customerId]) {
      customer[customerId] = [];
    }
    if (!customerTotalPoints[customerId]) {
      customerTotalPoints[name] = 0;
    }
    customerTotalPoints[name] += points;
    if (customer[customerId][month]) {
      customer[customerId][month].points += points;
      customer[customerId][month].monthNumber = month;
      customer[customerId][month].noOfTransactions++;
    }
    else {
      customer[customerId][month] = {
        customerId,
        name,
        monthNumber: month,
        month: months[month],
        noOfTransactions: 1,
        points
      }
    }
  });

  let tot = [];
  for (var custKey in customer) {
    customer[custKey].forEach(cRow => {
      tot.push(cRow);
    });
  }
  ;
  let customerTotal = [];
  for (custKey in customerTotalPoints) {
    customerTotal.push({
      name: custKey,
      points: customerTotalPoints[custKey]
    });
  }
  return {
    summaryByCustomer: tot,
    transactionPoints,
    customerTotalPoints: customerTotal
  };
}

function App() {

  const [transactionData, setTransactionData] = useState(null);

  const columns = [
    {
      Header: 'Customer',
      accessor: 'name'
    },
    {
      Header: 'Month',
      accessor: 'month'
    },
    {
      Header: "No of transactions",
      accessor: 'noOfTransactions'
    },
    {
      Header: 'Rewards',
      accessor: 'points'
    }
  ];
  const totalsByColumns = [
    {
      Header: 'Customer',
      accessor: 'name'
    },
    {
      Header: 'Points',
      accessor: 'points'
    }
  ]

  function getIndividualTransactions(row) {
    let byCustMonth = _.filter(transactionData.transactionPoints, (tRow) => {
      return row.original.customerId === tRow.customerId && row.original.monthNumber === tRow.month;
    });
    return byCustMonth;
  }

  useEffect(() => {
    fetch().then((data) => {
      const results = calculateResult(data);
      setTransactionData(results);
    });
  }, []);

  if (transactionData == null) {
    return <div>Loading...</div>;
  }

  return transactionData == null ?
    <div>Loading...</div>
    :
    <div>

      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Total Points Rewards by Customer (in Months)</h2>
            <br></br>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              data={transactionData.summaryByCustomer}
              defaultPageSize={5}
              columns={columns}
              SubComponent={row => {
                return (
                  <div>
                    {getIndividualTransactions(row).map(tran => {
                      return <div className="container">
                        <div className="row">
                          <div className="col-8">
                            <strong>Transaction Date:</strong> {tran.date} - <strong>$</strong>{tran.amount} - <strong>Points: </strong>{tran.points}
                          </div>
                        </div>
                      </div>
                    })}

                  </div>
                )
              }}
            />
          </div>
        </div>
      </div>
<br></br>
<br></br>
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Summary - Points Rewards - by Customer</h2>
            <br></br>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              data={transactionData.customerTotalPoints}
              columns={totalsByColumns}
              defaultPageSize={5}
            />
          </div>
        </div>
      </div>
    </div>
    ;
}

export default App;
