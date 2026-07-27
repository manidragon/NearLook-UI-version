import React from "react";
import { useFormik } from "formik";
import { Box, Button, MenuItem, Select, FormControl, InputLabel, TextField as MuiTextField, Switch, FormControlLabel } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { updateSeller } from "../../../redux/Seller/sellerSlice";

interface OperationsFormProps {
  onClose: () => void;
}

const OperationsForm = ({ onClose }: OperationsFormProps) => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.sellers);

  const formik = useFormik({
    initialValues: {
      fulfillmentMode: profile?.fulfillmentMode || "SELF_SHIP",
      handlingTime: profile?.handlingTime || 2,
      payoutSchedule: profile?.payoutSchedule || "WEEKLY",
      minFreeDelivery: profile?.minFreeDelivery ?? 500,
    },
    onSubmit: (values) => {
      const updatedData = {
        fulfillmentMode: values.fulfillmentMode,
        handlingTime: values.handlingTime,
        payoutSchedule: values.payoutSchedule,
        minFreeDelivery: values.minFreeDelivery,
      };

      dispatch(updateSeller(updatedData));
      onClose();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} className="space-y-5">
      <h1 className="text-xl font-bold mb-4">Operations & Fulfillment</h1>

      <FormControl fullWidth>
        <InputLabel>Fulfillment Mode</InputLabel>
        <Select
          name="fulfillmentMode"
          value={formik.values.fulfillmentMode}
          onChange={formik.handleChange}
          label="Fulfillment Mode"
        >
          <MenuItem value="SELF_SHIP">Self Ship</MenuItem>
          <MenuItem value="PLATFORM_FULFILLED">Platform Fulfilled</MenuItem>
          <MenuItem value="HYBRID">Hybrid</MenuItem>
        </Select>
      </FormControl>

      <MuiTextField
        fullWidth
        name="handlingTime"
        label="Handling Time (Days)"
        type="number"
        value={formik.values.handlingTime}
        onChange={formik.handleChange}
      />

      <FormControl fullWidth>
        <InputLabel>Payout Schedule</InputLabel>
        <Select
          name="payoutSchedule"
          value={formik.values.payoutSchedule}
          onChange={formik.handleChange}
          label="Payout Schedule"
        >
          <MenuItem value="DAILY">Daily</MenuItem>
          <MenuItem value="WEEKLY">Weekly</MenuItem>
          <MenuItem value="BI_WEEKLY">Bi-Weekly</MenuItem>
          <MenuItem value="MONTHLY">Monthly</MenuItem>
        </Select>
      </FormControl>

      <MuiTextField
        fullWidth
        name="minFreeDelivery"
        label="Min Order for Free Delivery (₹)"
        type="number"
        value={formik.values.minFreeDelivery}
        onChange={formik.handleChange}
      />
      <Button fullWidth type="submit" variant="contained" sx={{ py: "14px" }}>
        Save Operations Settings
      </Button>
    </Box>
  );
};

export default OperationsForm;
