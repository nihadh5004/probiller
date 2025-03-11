import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Button,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  UilArchive,
  UilMoneyStack,
  UilPizzaSlice,
} from "@iconscout/react-unicons";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import sendAsync from "../message-control/renderrer";
import OrdersCountChart from "../components/OrdersChart";
import { DateTime } from "luxon";
import { DateRange, DateRangePicker, DefinedRange } from "react-date-range";

const Dashboard = (props) => {
  const [dashBoardStats, setDashboardStats] = useState({
    orders: "_",
    revenue: "_",
    items: "_",
    revenueBreak: { cash: 0, bank: 0 },
  });
  const todaysDate = new Date();
  const [dateRange, setDateRange] = useState([
    {
      startDate: todaysDate,
      endDate: todaysDate,
      key: "selection",
    },
  ]);
  const [topItems, setTopItems] = useState([]);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [chartData, setChartData] = useState("");

  const getOrders = async () => {
    let ordersResponse = await sendAsync(
      `SELECT * FROM orders WHERE date BETWEEN '${DateTime.fromJSDate(
        dateRange[0].startDate
      ).toFormat("yyyy-MM-dd 00:00:00")}' AND '${DateTime.fromJSDate(
        dateRange[0].endDate
      ).toFormat("yyyy-MM-dd 24:00:00")}'`
    );

    let cashRev = 0;
    let bankRev = 0;

    let revenueBreak = ordersResponse.map((item) => {
      item.payment === "CASH"
        ? (cashRev += item.total_amount)
        : (bankRev += item.total_amount);
    });

    let revenue = ordersResponse.reduce(
      (sum, item) => sum + +item.total_amount,
      0
    );

    let items = ordersResponse.reduce(
      (sum, item) => sum + JSON.parse(item.products).length,
      0
    );

    setDashboardStats({
      orders: ordersResponse.length,
      revenue: "₹" + revenue,
      items,
      revenueBreak: { cash: cashRev, bank: bankRev },
    });
    let count = {};
    let itemsonly = ordersResponse.map((item) => JSON.parse(item.products));
    itemsonly = itemsonly.reduce((a, b) => a.concat(b), []);
    for (let i of itemsonly) {
      count.hasOwnProperty(i.id)
        ? (count[i.id] = +count[i.id] + +i.qty)
        : (count[i.id] = +i.qty);
    }
    let result = Object.keys(count).map((key) => ({
      id: +key,
      count: count[key],
      name: itemsonly.find((item) => item.id === +key).name,
    }));
    setTopItems(result.sort((a, b) => a.count - b.count).reverse());

    let ordersChartData = await sendAsync(
      `select date, count(id)from orders  WHERE date BETWEEN '${DateTime.fromJSDate(
        dateRange[0].startDate
      ).toFormat("yyyy-MM-dd 00:00:00")}' AND '${DateTime.fromJSDate(
        dateRange[0].endDate
      ).toFormat("yyyy-MM-dd 24:00:00")}' group by date(date) `
    );

    console.log(ordersChartData);
    let revenueChartData = await sendAsync(
      `select date, sum(total_amount) as total from orders  WHERE date BETWEEN '${DateTime.fromJSDate(
        dateRange[0].startDate
      ).toFormat("yyyy-MM-dd 00:00:00")}' AND '${DateTime.fromJSDate(
        dateRange[0].endDate
      ).toFormat("yyyy-MM-dd 24:00:00")}'  group by date(date)`
    );

    ordersChartData = ordersChartData.map((item) => ({
      dates: DateTime.fromJSDate(new Date(item.date)).toFormat("dd-MM-yyyy"),
      counts: item["count(id)"],
    }));

    revenueChartData = revenueChartData.map((item) => ({
      dates: DateTime.fromJSDate(new Date(item.date)).toFormat("dd-MM-yyyy"),
      counts: item.total,
    }));

    setChartData({ orders: ordersChartData, revenue: revenueChartData });
  };
  useEffect(() => {
    getOrders();
  }, []);

  const DetailsIcon = ({ data, name, icon, color, isRevenue }) => {
    return (
      <Stack flexDirection="row" spacing="0" h="60px">
        <Box
          backgroundColor={color}
          boxSize="55px"
          display="grid"
          placeItems="center"
          borderRadius="10px"
        >
          {icon}
        </Box>
        <Stack spacing="0" pl="10px">
          <Text color="#a6a6a6">{name}</Text>
          <Text fontWeight="bold" fontSize="22px">
            {data}
          </Text>
          {isRevenue && (
            <Text fontSize="12px" fontWeight="medium" color="gray.500">
              Cash:{dashBoardStats.revenueBreak.cash} , Bank :
              {dashBoardStats.revenueBreak.bank}
            </Text>
          )}
        </Stack>
      </Stack>
    );
  };

  return (
    <Stack backgroundColor="#eef2f9" p="40px" ml="250px" h="100%" spacing="0">
      <Stack w="100%" justifyContent="space-between" flexDirection="row">
        <Stack spacing="0">
          <Heading size="lg">Dashboard</Heading>
          <Text>{new Date().toDateString()}</Text>
        </Stack>
        <Stack position="relative" spacing="0" flexDirection="column">
          <Stack
            spacing="0"
            flexDirection="row"
            cursor="pointer"
            onClick={() => setIsDateOpen((old) => !old)}
          >
            <Box
              borderRadius="6px"
              backgroundColor="white"
              p="10px"
              mr="14px !important"
              _hover={{ backgroundColor: "#e6e6e6" }}
            >
              {DateTime.fromJSDate(dateRange[0].startDate).toFormat(
                "dd/MM/yyyy"
              )}

              {dateRange[0]?.startDate !== dateRange[0]?.endDate &&
                " - " +
                  DateTime.fromJSDate(dateRange[0].endDate).toFormat(
                    "dd/MM/yyyy"
                  )}
            </Box>
          </Stack>
          {isDateOpen && (
            <Box position="absolute" top="60px" right="40px">
              <DateRange
                onChange={(item) => {
                  setDateRange([item.selection]);
                }}
                ranges={dateRange}
                showMonthAndYearPickers={false}
                showDateDisplay={false}
              />
              <Button
                bgColor="#00d67e"
                mt="10px"
                float="right"
                color="white"
                onClick={() => {
                  getOrders();
                  setIsDateOpen(false);
                }}
              >
                Update
              </Button>
            </Box>
          )}
        </Stack>
      </Stack>

      <Grid width="100%" templateColumns="2fr 1fr" gap={4}>
        <GridItem>
          <Flex
            mt="30px !important"
            borderRadius="15px"
            bgColor="white"
            justifyContent="space-between"
            flexDirection="row"
            p="20px"
            pl="40px"
            pr="40px"
            boxShadow="rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"
            alignItems="center"
          >
            <DetailsIcon
              color="#FF9E9F"
              data={dashBoardStats.orders}
              name="Orders"
              icon={<UilArchive size="40px" color="#fff" />}
            />

            <DetailsIcon
              color="#ffd45e"
              data={dashBoardStats.revenue}
              name="Revenue"
              icon={<UilMoneyStack size="40px" color="#fff" />}
              isRevenue={true}
            />

            <DetailsIcon
              data={dashBoardStats.items}
              name="Items"
              icon={<UilPizzaSlice size="40px" color="#fff" />}
              color="#FFC09F"
            />
          </Flex>
        </GridItem>
        <GridItem rowSpan={10}>
          <Flex
            mt="30px !important"
            borderRadius="15px"
            bgColor="white"
            justifyContent="space-around"
            flexDirection="column"
            p="20px"
            boxShadow="rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"
            alignItems="center"
          >
            <Heading w="100%" size="md" alignSelf="flex-start">
              Top Items
            </Heading>
            <Stack mt="10px" flexDirection="column" w="100%">
              {topItems?.map((item) => (
                <Stack
                  key={item.id}
                  spacing="0"
                  flexDirection="row"
                  w="100%"
                  justifyContent="space-between"
                >
                  <Text color="gray.500">{item.name}</Text>
                  <Text fontWeight="bold">{item.count}</Text>
                </Stack>
              ))}
            </Stack>
          </Flex>
        </GridItem>
        <GridItem>
          <Flex
            borderRadius="15px"
            bgColor="white"
            justifyContent="space-around"
            flexDirection="column"
            p="20px"
            boxShadow="rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"
            alignItems="center"
          >
            <Heading w="100%" size="md" alignSelf="flex-start">
              Orders
            </Heading>
            {chartData !== "" && <OrdersCountChart datas={chartData} />}
          </Flex>
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default Dashboard;
