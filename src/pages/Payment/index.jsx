import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import CheckOutlined from "@ant-design/icons/CheckOutlined";

import MainCard from "components/MainCard";
import { PaymentApiService } from "services/api/Payment";

function Payment() {
  const theme = useTheme();

  const [pricingData, setPricingData] = useState([]);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    document.title = "Subscription Plans";

    PaymentApiService.getProducts()
      .then((response) => {
        setPricingData(response?.data?.products || []);
      })
      .catch(() => {
        setSnackData({
          show: true,
          message: "Failed to load pricing plans.",
          type: "error",
        });
      });
  }, []);

  const handleSelectPlan = (plan) => {
    setCheckoutLoadingId(plan.id);

    sessionStorage.setItem(
      "selectedPlan",
      JSON.stringify({
        name: plan.name,
        amount: plan.amount,
        contract_count: plan.contract_count,
      }),
    );

    PaymentApiService.createCheckout({
      price_id: plan.price_id,
    })
      .then((response) => {
        const checkoutUrl = response?.data?.checkout_url;

        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          throw new Error("Checkout URL not found.");
        }
      })
      .catch(() => {
        setCheckoutLoadingId(null);

        setSnackData({
          show: true,
          message: "Failed to start checkout. Please try again.",
          type: "error",
        });
      });
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Stack spacing={2} my={6} alignItems="center">
          <Typography variant="h1" fontWeight={700} textAlign="center">
            Finalize Your Subscription
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            textAlign="center"
            sx={{ maxWidth: 650 }}
          >
            Purchase additional contracts to continue using AI Due Diligence.
          </Typography>
        </Stack>

        <Grid container spacing={3} justifyContent="center">
          {pricingData.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <MainCard
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.customShadows.z1,
                  },
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="h4" fontWeight={600} gutterBottom>
                    {plan.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      minHeight: 40,
                      mb: 3,
                    }}
                  >
                    {plan.description}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="baseline"
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="h2" fontWeight={700}>
                      ${plan.amount / 100}
                    </Typography>
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={checkoutLoadingId === plan.id}
                    sx={{
                      mb: 4,
                      py: 1.5,
                      borderRadius: 2,
                    }}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {checkoutLoadingId === plan.id
                      ? "Redirecting..."
                      : "Buy Now"}
                  </Button>

                  <Divider sx={{ mb: 3 }} />

                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 2 }}
                  >
                    What's Included
                  </Typography>

                  <List sx={{ p: 0 }}>
                    {plan.metadata &&
                      Object.entries(plan.metadata).map(([key, value]) => (
                        <ListItem
                          key={key}
                          disableGutters
                          sx={{
                            alignItems: "flex-start",
                            py: 1,
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 32,
                              mt: 0.5,
                            }}
                          >
                            <CheckOutlined
                              style={{
                                color: theme.palette.success.main,
                                fontSize: 16,
                              }}
                            />
                          </ListItemIcon>

                          <ListItemText
                            primary={value}
                            primaryTypographyProps={{
                              variant: "body2",
                            }}
                          />
                        </ListItem>
                      ))}
                  </List>
                </Box>
              </MainCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Snackbar
        open={snackData.show}
        autoHideDuration={3000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={() =>
          setSnackData((prev) => ({
            ...prev,
            show: false,
          }))
        }
        sx={{ top: "80px" }}
      >
        <Alert
          severity={snackData.type}
          onClose={() =>
            setSnackData((prev) => ({
              ...prev,
              show: false,
            }))
          }
        >
          {snackData.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Payment;