import React, { useRef, useState } from "react";
import "@babel/polyfill";
import {
  Stack,
  Text,
  Box,
  Button,
  Input,
  FormLabel,
  FormControl,
  IconButton,
} from "@chakra-ui/react";
import {
  Radio,
  RadioGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
} from "@chakra-ui/react";
import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/react";
import { UilTrashAlt } from "@iconscout/react-unicons";

import sendAsync from "../message-control/renderrer";

import AsyncSelect from "react-select/async";
import { useHistory } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import BillPrint from "../components/billPrint";
import { useHotkeys } from "react-hotkeys-hook";

const Bill = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [discount, setDiscount] = useState(0); // New state for discount percentage
  const [isLoading, setIsLoading] = useState(false);
  const [billProducts, setBillProducts] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [payment, setPayment] = useState("CASH");
  const [toPrint, setToPrint] = useState("");
  const [recieptOpen, setRecieptOpen] = useState(false);

  const history = useHistory();
  const selectRef = useRef();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleQuantity = (i, value) => {
    let productsCopy = [...billProducts];
    productsCopy[i] = {
      ...productsCopy[i],
      qty: value,
    };
    setBillProducts(productsCopy);
  };

  const searchProducts = async (searchTerm, callBack) => {
    const response = await sendAsync(`SELECT * FROM products
      WHERE name LIKE '%${searchTerm}%'`);
    const filteredResponse = response.map((product) => ({
      value: product,
      label: product.name,
    }));

    callBack(filteredResponse);
  };

  const printReciept = () => {
    setRecieptOpen(true);
    setTimeout(async () => {
      printNow();
      setRecieptOpen(false);
    }, 100);
  };

  const printNow = useReactToPrint({
    content: () => document.getElementById("order_reciept"),
    pageStyle:
      "@media print { body { margin: 0; color: #000; background-color: #fff; } img {width:100%;} }",
  });

  const addOrder = async () => {
    if (billProducts.length < 1) return;

    setIsLoading(true);

    // Calculate total and discounted total
    const total = billProducts.reduce((prev, curr) => prev + curr.qty * curr.price, 0);
    const discountedTotal = total * (1 - discount / 100);

    // Save order with discount percentage and discounted total
    const resp = await sendAsync(
      `INSERT INTO orders (date, products, total_amount, payment, name, mobile, discount, discountedTotal)
      VALUES(datetime('now', 'localtime'),
      '${JSON.stringify(billProducts)}',
      '${total}',
      '${payment}',
      '${customerName}',
      '${customerMobile}',
      '${discount}',
      '${discountedTotal}')`
    );
    console.log(resp);

    const latestOrder = await sendAsync(
      "SELECT * FROM orders ORDER BY id DESC LIMIT 1"
    );
    setToPrint(latestOrder[0]);
    setBillProducts([]);
    setCustomerMobile("");
    setCustomerName("");
    setPayment("CASH");
    setDiscount(0); // reset discount after order
    printReciept();

    setIsLoading(false);
    // history.push("/orders");
  };

  useHotkeys("ctrl+enter", () => billProducts.length > 0 && addOrder(), {
    enableOnTags: ["SELECT", "INPUT", "TEXTAREA"],
  });

  return (
    <Stack backgroundColor="#eef2f9" ml="250px" h="100vh">
      {recieptOpen && <BillPrint data={{ ...toPrint }} />}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        blockScrollOnMount={true}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <form>
            <Stack padding="30px">
              <Input
                type="number"
                value={selectedItem.qty}
                onChange={(e) =>
                  setSelectedItem((old) => ({ ...old, qty: +e.target.value }))
                }
                mb="10px"
              />
              <Button
                bgColor="#00d67e"
                color="white"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  setBillProducts((old) => [
                    ...old,
                    {
                      ...selectedItem,
                      qty:
                        selectedItem.qty === "" || selectedItem.qty === 0
                          ? 1
                          : selectedItem.qty,
                    },
                  ]);
                  onClose();
                }}
              >
                Add Item
              </Button>
            </Stack>
          </form>
        </ModalContent>
      </Modal>
      <Stack
        borderRadius="15px"
        m="40px"
        bgColor="white"
        p="40px"
        boxShadow="rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"
      >
        <Text fontWeight="bold" fontSize="20px" mb="20px">
          Add Order
        </Text>
        <Stack width="80%" direction="row">
          <FormControl w="50%">
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="name here"
            />
          </FormControl>
          <FormControl w="50%">
            <FormLabel>Mobile</FormLabel>
            <Input
              type="number"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              placeholder="91xxxxxxx"
            />
          </FormControl>
        </Stack>
       
        <Box w="40%" mt="20px">
          <AsyncSelect
            ref={selectRef}
            loadOptions={searchProducts}
            onChange={(input) => {
              setSelectedItem({ ...input.value, qty: "" });
              onOpen();
            }}
          />
        </Box>

        <Table variant="simple" mt="20px">
          <Thead>
            <Tr>
              <Th>No</Th>
              <Th>Item</Th>
              <Th isNumeric>Price</Th>
              <Th>Qty</Th>
              <Th isNumeric>Total</Th>
              <Th isNumeric>Delete</Th>
            </Tr>
          </Thead>
          <Tbody>
            {billProducts?.map((item, i) => (
              <Tr key={i}>
                <Td>{i + 1}</Td>
                <Td>{item.name}</Td>
                <Td isNumeric>₹{item.price}</Td>
                <Td>
                  <Stack spacing={1} direction="row">
                    <Button
                      isDisabled={item.qty === 1}
                      onClick={() => handleQuantity(i, +item.qty - 1)}
                    >
                      -
                    </Button>
                    <Input
                      w="80px"
                      type="number"
                      onChange={(e) => handleQuantity(i, +e.target.value)}
                      value={item.qty}
                    />
                    <Button onClick={() => handleQuantity(i, +item.qty + 1)}>
                      +
                    </Button>
                  </Stack>
                </Td>
                <Td isNumeric>₹{item.price * item.qty}</Td>
                <Td isNumeric>
                  <IconButton
                    onClick={() => {
                      setBillProducts((old) =>
                        old.filter((_, currIndex) => i !== currIndex)
                      );
                    }}
                    p="2px"
                    ml="10px"
                    borderRadius="full"
                    icon={<UilTrashAlt size="20px" color="red" />}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Stack alignSelf="flex-end" pr="20px" pt="60px">
          <Stack direction="row" mb="20px">
            <Text fontWeight="bold">Grand Total: </Text>
            <Text fontWeight="bold" pl="20px">
              ₹
              {billProducts.length > 0 &&
                billProducts.reduce(
                  (prev, curr) => prev + curr.qty * curr.price,
                  0
                )}
            </Text>
          </Stack>
          <FormControl width="100%" mb="20px">
            <FormLabel>Discount (%)</FormLabel>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="Enter discount percentage"
            />
          </FormControl>
          {billProducts.length > 0 && (
            <Stack direction="row" mb="20px">
              <Text fontWeight="bold">Discounted Total: </Text>
              <Text fontWeight="bold" pl="20px">
                ₹
                {billProducts.length > 0 &&
                  (
                    billProducts.reduce(
                      (prev, curr) => prev + curr.qty * curr.price,
                      0
                    ) * (1 - discount / 100)
                  ).toFixed(2)}
              </Text>
            </Stack>
          )}

          <FormControl pb="20px">
            <FormLabel>Payment</FormLabel>
            <RadioGroup onChange={setPayment} value={payment}>
              <Stack direction="row">
                <Radio value="CASH">CASH</Radio>
                <Radio value="ONLINE">ONLINE</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          <Button
            size="lg"
            isDisabled={billProducts.length < 1}
            bgColor="#00d67e"
            color="white"
            mr="80px"
            alignSelf="flex-end"
            onClick={addOrder}
            isLoading={isLoading}
          >
            Bill Products
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Bill;
