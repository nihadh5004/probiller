import { Stack, Text, Box, Image } from "@chakra-ui/react";
import React from "react";
import logo from "../assets/shop-logo.png";
import insta from "../assets/instagram.png";

const BillPrint = ({ data }) => (
  <Stack
    id="order_reciept"
    position="relative"
    w="7.8cm"
    h="auto"
    alignItems="center"
    spacing="0"
    fontWeight="medium"
  >
    {/* <Text fontWeight="bold">SKEWERS</Text> */}
    <Image src={logo} w="80%" />
    <Text fontSize="15px" textAlign="center" pb="5px" pt="1px">
    Opp. Kristu Jayanti College, Bangalore
    </Text>
    <Text fontSize="15px" fontWeight="medium">
      Mob: 9747663224
    </Text>
    <Stack direction="column" w="100%" pt="15px" spacing="0.5px">
      <Text fontSize="15px">{`Name: ${data.name}`} </Text>
      <Text fontSize="15px">{`Mobile: ${data.mobile}`} </Text>
    </Stack>

    <Stack direction="row" w="100%" justifyContent="space-between" pt="15px">
      <Text fontWeight="bold" fontSize="15px">
        {`Bill#:${data.id}`}{" "}
      </Text>
      <Text fontSize="15px">{`Date: ${new Date(data.date).toLocaleDateString(
        "en-IN"
      )} - ${new Date(data.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`}</Text>
    </Stack>
    <Stack
      pt="20px"
      direction="row"
      fontSize="13px"
      justifyContent="space-between"
      w="100%"
      fontWeight="medium"
      borderBottom="1px solid #000"
      paddingBottom="6px"
    >
      <Text w="10%">No</Text>
      <Text w="40%">Item</Text>
      <Text w="15%">Qty</Text>
      <Text w="15%">Rate</Text>
      <Text w="20%">Total</Text>
    </Stack>
    {JSON.parse(data.products).map((item, i) => (
      <Stack
        key={i}
        pt="10px"
        direction="row"
        fontSize="14px"
        justifyContent="space-between"
        w="100%"
      >
        <Text w="10%">{i + 1}</Text>
        <Text w="40%">{item.name}</Text>
        <Text w="15%">{item.qty}</Text>
        <Text w="15%">₹{item.price} </Text>
        <Text w="20%" fontWeight="medium">
          ₹{item.price * item.qty}
        </Text>
      </Stack>
    ))}
    <Stack direction="row" pt="15px" justifyContent="space-between" w="100%">
      <Text fontWeight="bold">Grant Total</Text>
      <Text fontWeight="bold">₹{data.total_amount}</Text>
    </Stack>

    <Box h="85px">&nbsp;</Box>
    <Box position="absolute" bottom="8px">
      <Text fontWeight="medium" fontSize="14px" textAlign="center">
        THANK YOU, VISIT AGAIN
      </Text>
      <Stack direction="row" justifyContent="center" alignItems="center">
        <Image w="15px" h="15px" src={insta} />
        <Text fontWeight="medium  ">kibo__1.0</Text>
      </Stack>
    </Box>
  </Stack>
);

export default BillPrint;
