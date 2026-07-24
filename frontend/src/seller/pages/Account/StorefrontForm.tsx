import React from "react";
import { useFormik } from "formik";
import { Box, Button, TextField as MuiTextField, Switch, FormControlLabel } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { updateSeller } from "../../../redux/Seller/SellerSlice";

interface StorefrontFormProps {
  onClose: () => void;
}

const StorefrontForm = ({ onClose }: StorefrontFormProps) => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.sellers);

  const formik = useFormik({
    initialValues: {
      description: profile?.storefront?.description || "",
      themeColor: profile?.storefront?.themeColor || "#1976d2",
      holidayMode: profile?.storefront?.holidayMode || false,
      facebook: profile?.storefront?.socialLinks?.facebook || "",
      instagram: profile?.storefront?.socialLinks?.instagram || "",
      twitter: profile?.storefront?.socialLinks?.twitter || "",
      website: profile?.storefront?.socialLinks?.website || "",
      promotions: profile?.storefront?.promotions?.join("\n") || "",
    },
    onSubmit: (values) => {
      const updatedData = {
        storefront: {
          description: values.description,
          themeColor: values.themeColor,
          holidayMode: values.holidayMode,
          promotions: values.promotions.split("\n").filter(p => p.trim() !== ""),
          socialLinks: {
            facebook: values.facebook,
            instagram: values.instagram,
            twitter: values.twitter,
            website: values.website,
          }
        }
      };

      dispatch(updateSeller(updatedData));
      onClose();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} className="space-y-5">
      <h1 className="text-xl font-bold mb-4">Storefront Customization</h1>

      <MuiTextField
        fullWidth
        name="description"
        label="Store Description"
        multiline
        rows={3}
        value={formik.values.description}
        onChange={formik.handleChange}
      />

      <MuiTextField
        fullWidth
        name="promotions"
        label="Promotional Banners (One per line)"
        multiline
        rows={2}
        value={formik.values.promotions}
        onChange={formik.handleChange}
        placeholder="e.g. Use code SAKTHI10 for 10% off!"
      />

      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-600 font-semibold">Theme Color:</label>
        <input
          type="color"
          name="themeColor"
          value={formik.values.themeColor}
          onChange={formik.handleChange}
          className="w-10 h-10 border-0 p-0 cursor-pointer"
        />
        <span className="text-sm font-mono">{formik.values.themeColor}</span>
      </div>

      <div className="border p-4 rounded-md border-gray-300">
        <h3 className="text-md font-semibold text-gray-700 mb-3">Social Links</h3>
        <div className="space-y-4">
          <MuiTextField fullWidth name="facebook" label="Facebook URL" value={formik.values.facebook} onChange={formik.handleChange} />
          <MuiTextField fullWidth name="instagram" label="Instagram URL" value={formik.values.instagram} onChange={formik.handleChange} />
          <MuiTextField fullWidth name="twitter" label="Twitter URL" value={formik.values.twitter} onChange={formik.handleChange} />
          <MuiTextField fullWidth name="website" label="Website URL" value={formik.values.website} onChange={formik.handleChange} />
        </div>
      </div>

      <FormControlLabel
        control={
          <Switch
            name="holidayMode"
            checked={formik.values.holidayMode}
            onChange={formik.handleChange}
            color="warning"
          />
        }
        label="Enable Holiday Mode (Alerts customers of shipping delays)"
      />

      <Button fullWidth type="submit" variant="contained" sx={{ py: "14px" }}>
        Save Storefront Settings
      </Button>
    </Box>
  );
};

export default StorefrontForm;
