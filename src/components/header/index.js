import { Box, IconButton, Image, Stack, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import logo from "../../assets/shop-logo.png";

import {
  UilChart,
  UilShoppingBasket,
  UilReceiptAlt,
  UilArchive,
} from "@iconscout/react-unicons";
import "./style.css";

import { Link, Redirect, useHistory, useLocation } from "react-router-dom";

const Header = () => {
  const currLocation = useLocation().pathname.split("/")[1];
  const loc = useLocation();
  const NavItem = ({ tag, path, icon }) => (
    <Link to={`/${path}`}>
      <Stack
        //onClick={()=>history.push(`/${path}`)}

        direction="row"
        alignItems="center"
        backgroundColor={currLocation === path ? "#edefff" : "#fff"}
        borderRadius="12px"
      >
        <IconButton
          bgColor="white"
          icon={icon}
          backgroundColor={currLocation === path ? "#edefff" : "#fff"}
          borderRadius="12px"
        />
        <Text
          fontWeight={currLocation === path ? "bold" : "medium"}
          color={currLocation === path ? "#303778" : "#999BA0"}
        >
          {tag}
        </Text>
      </Stack>
    </Link>
  );

  return (
    <Stack
      w="250px"
      h="100%"
      position="fixed"
      backgroundColor="white"
      boxShadow="rgba(149, 157, 165, 0.2) 0px 0px 16px"
    >
      <Box h="6px" backgroundColor="gray.500" width="100%"></Box>

      <Stack direction="column" p="20px">
        <Image p="10px" mb="30px" w="80%" src={logo} borderRadius="10px" />

        <NavItem
          tag="Dashboard"
          icon={
            <UilChart
              size="20"
              color={currLocation === "" ? "#303778" : "#898A8C"}
            />
          }
          path=""
        />
        <NavItem
          tag="Bill"
          icon={
            <UilReceiptAlt
              size="20"
              color={currLocation === "bill" ? "#303778" : "#898A8C"}
            />
          }
          path="bill"
        />
        <NavItem
          tag="Orders"
          icon={
            <UilArchive
              size="20"
              color={currLocation === "orders" ? "#303778" : "#898A8C"}
            />
          }
          path="orders"
        />
        <NavItem
          tag="Products"
          icon={
            <UilShoppingBasket
              size="20"
              color={currLocation === "products" ? "#303778" : "#898A8C"}
            />
          }
          path="products"
        />
      </Stack>
    </Stack>
  );
};

export default Header;
