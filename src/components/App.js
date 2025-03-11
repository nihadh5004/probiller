import React, { useEffect, useState } from "react";
// import "../style/index.css";

import Header from "./header";
import Dashboard from "../routes/dashboard.js";
import Products from "../routes/products.js";
import ProductAdd from "../routes/product_add";
import Orders from "../routes/orders";
import Bill from "../routes/bill.js";

import { ChakraProvider, Box } from "@chakra-ui/react";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import BillEdit from "../routes/billEdit";

const App = () => {
  return (
    <ChakraProvider>
      <div id="app">
        <MemoryRouter>
          <Header />
          <Switch>
            <Route exact component={Products} path="/products" />
            <Route exact component={Orders} path="/orders" />
            <Route exact component={ProductAdd} path="/products/add" />
            <Route exact component={Bill} path="/bill" />
            <Route exact component={BillEdit} path="/billedit/:id" />
            <Route exact component={Dashboard} path="/" />
          </Switch>
        </MemoryRouter>
      </div>
    </ChakraProvider>
  );
};

export default App;
