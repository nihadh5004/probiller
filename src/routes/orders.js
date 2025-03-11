import React, { useEffect, useState } from "react";

import {
  Stack,
  Text,
  Input,
  Box,
  Skeleton,
  useDisclosure,
  Button,
  Tooltip,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Badge,
  Tr,
  Th,
  Td,
  TableCaption,
  IconButton,
  SkeletonCircle,
} from "@chakra-ui/react";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

import BillPrint from "../components/billPrint";
import {
  UilTrashAlt,
  UilReceiptAlt,
  UilPrint,
  UilPen,
} from "@iconscout/react-unicons";
import { useHistory } from "react-router-dom";
import sendAsync from "../message-control/renderrer";
import { DateTime } from "luxon";
import { useReactToPrint } from "react-to-print";
import ConfirmDialog from "../components/confirmDialog";

// Note: `user` comes from the URL, courtesy of our router
const Orders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState();
  const [orders, setOrders] = useState([]);
  const [recieptOpen, setRecieptOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();
  const pageItemsMax = 10;

  const getOrders = async (pagenNo) => {
    const response = await sendAsync(
      `SELECT * FROM orders ORDER BY id DESC LIMIt ${
        (pagenNo - 1) * pageItemsMax
      },${pageItemsMax}`
    );
    setOrders((old) => [...old, ...response]);
    setIsLoading(false);
  };

  useEffect(() => getOrders(page), [page]);

  const printReciept = (orderDetails) => {
    setSelectedOrder(orderDetails);
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

  const downloadReciept = (orderDetails) => {
    setSelectedOrder(orderDetails);
    onOpen();
  };

  return (
    <Stack backgroundColor="#eef2f9" ml="250px" height="100%" minHeight="100vh">
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order#:{selectedOrder?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="grid" placeItems="center" mb="10px">
            <BillPrint data={selectedOrder} />
          </ModalBody>
        </ModalContent>
      </Modal>
      {recieptOpen && <BillPrint data={{ ...selectedOrder }} />}
      <Box
        borderRadius="15px"
        m="40px"
        bgColor="white"
        p="40px"
        boxShadow="rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"
      >
        <Stack w="100%" direction="row" justifyContent="space-between">
          <Text fontWeight="bold" fontSize="20px" mb="20px">
            Orders
          </Text>
          <Button
            onClick={() => history.push("/bill")}
            bgColor="#00d67e"
            color="white"
          >
            Add Order
          </Button>
        </Stack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>id</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th isNumeric>Total Amount</Th>
              <Th>Payment</Th>

              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading && (
              <Tr>
                <Td>
                  <Skeleton>loading</Skeleton>
                </Td>

                <Td>
                  <Skeleton>loading</Skeleton>
                </Td>

                <Td isNumeric>
                  <Skeleton>140</Skeleton>
                </Td>
                <Td>
                  <Skeleton>loading</Skeleton>
                </Td>

                <Td>
                  <SkeletonCircle size="10" />
                </Td>
              </Tr>
            )}
            {orders?.map((item) => (
              <Tr key={item.id}>
                <Td>{item.id}</Td>
                <Td>
                  <Stack spacing="0">
                    <Text>
                      {DateTime.fromISO(
                        new Date(item.date).toISOString()
                      ).toFormat("dd/MM/yyyy")}
                    </Text>
                    <Text fontSize="13px">
                      {DateTime.fromISO(
                        new Date(item.date).toISOString()
                      ).toFormat("t")}
                    </Text>
                  </Stack>
                </Td>
                <Td>
                  <Stack spacing="0">
                    <Text>{item.name}</Text>
                    <Text fontSize="13px" fontWeight="bold" color="#787878">
                      {item.mobile}
                    </Text>
                  </Stack>
                </Td>

                <Td isNumeric fontWeight="bold">
                  ₹{item.total_amount}
                </Td>
                <Td>
                  {item.payment === "CASH" ? (
                    item.payment
                  ) : (
                    <Badge color="white" variant="solid" colorScheme="green">
                      {item.payment}
                    </Badge>
                  )}
                </Td>

                <Td>
                  <Stack direction="row">
                    <IconButton
                      p="2px"
                      onClick={() => {
                        printReciept({ ...item });
                      }}
                      borderRadius="full"
                      icon={<UilPrint size="20px" color="orange" />}
                    />
                    <IconButton
                      p="2px"
                      ml="10px"
                      onClick={() => downloadReciept({ ...item })}
                      borderRadius="full"
                      icon={<UilReceiptAlt size="20px" color="green" />}
                    />
                    <IconButton
                      p="2px"
                      onClick={() => {
                        history.push(`/billedit/${item.id}`);
                      }}
                      borderRadius="full"
                      icon={<UilPen size="20px" color="orange" />}
                    />
                    <ConfirmDialog
                      caption={`Are you sure to delete order #${item.id}`}
                      trigger={
                        <IconButton
                          p="2px"
                          ml="10px"
                          borderRadius="full"
                          icon={<UilTrashAlt size="20px" color="red" />}
                        />
                      }
                      callback={async () => {
                        await sendAsync(
                          `DELETE FROM orders WHERE id=${item.id}`
                        );
                        setOrders((old) =>
                          old.filter((ordr) => ordr.id !== item.id)
                        );
                      }}
                    />
                  </Stack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Button onClick={() => setPage((old) => old + 1)} mt="10px">
          Load More
        </Button>
      </Box>
    </Stack>
  );
};

export default Orders;
