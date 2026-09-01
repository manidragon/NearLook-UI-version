// D:\Mani\Code with Zosh\Backup\source code\frontend\src\seller\pages\Account\BussinessDetailsForm.tsx
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "../../../components/NeonButton";
import TextField from "../../../components/CustomTextField";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { updateSeller } from "../../../redux/Seller/sellerSlice";

interface UpdateDetailsFormProps {
  onClose: () => void;
}

const BusinessDetailsForm = ({ onClose }: UpdateDetailsFormProps) => {
  const dispatch = useAppDispatch();
  const sellers = useAppSelector((state) => state.sellers);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      businessName: "",
      businessEmail: "",
      businessMobile: "",
      GSTIN: "",
      PAN: "",
      businessType: "SOLE_PROPRIETOR",
    },
    validationSchema: Yup.object({
      businessName: Yup.string().required("Business Name is required"),
      businessEmail: Yup.string().email("Invalid email").required("Business Email is required"),
      businessMobile: Yup.string().required("Business Mobile is required"),
      GSTIN: Yup.string().required("GSTIN is required"),
      PAN: Yup.string().nullable(),
      businessType: Yup.string().required("Business Type is required"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      
      try {
        await dispatch(
          updateSeller({
            businessDetails: {
              businessName: values.businessName,
              businessEmail: values.businessEmail,
              businessMobile: values.businessMobile,
            },
            GSTIN: values.GSTIN,
            PAN: values.PAN,
            businessType: values.businessType as any,
          })
        ).unwrap();
        
        onClose();
      } catch (error) {
        console.error("Update failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (sellers.profile) {
      formik.setValues({
        businessName: sellers.profile?.businessDetails?.businessName || "",
        businessEmail: sellers.profile?.businessDetails?.businessEmail || "",
        businessMobile: sellers.profile?.businessDetails?.businessMobile || "",
        GSTIN: sellers.profile?.GSTIN || "",
        PAN: sellers.profile?.PAN || "",
        businessType: sellers.profile?.businessType || "SOLE_PROPRIETOR",
      });
    }
  }, [sellers.profile]);

  return (
    <>
      <h1 className="text-xl pb-5 text-center font-bold text-gray-600">
        Business Details
      </h1>
      <form className="space-y-5" onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="businessName"
          name="businessName"
          label="Business Name"
          value={formik.values.businessName}
          onChange={formik.handleChange}
          error={formik.touched.businessName && Boolean(formik.errors.businessName)}
          helperText={formik.touched.businessName && formik.errors.businessName}
        />
        <TextField
          fullWidth
          id="businessEmail"
          name="businessEmail"
          label="Business Email"
          value={formik.values.businessEmail}
          onChange={formik.handleChange}
          error={formik.touched.businessEmail && Boolean(formik.errors.businessEmail)}
          helperText={formik.touched.businessEmail && formik.errors.businessEmail}
        />
        <TextField
          fullWidth
          id="businessMobile"
          name="businessMobile"
          label="Business Mobile"
          value={formik.values.businessMobile}
          onChange={formik.handleChange}
          error={formik.touched.businessMobile && Boolean(formik.errors.businessMobile)}
          helperText={formik.touched.businessMobile && formik.errors.businessMobile}
        />

        <TextField
          fullWidth
          id="GSTIN"
          name="GSTIN"
          label="GSTIN"
          value={formik.values.GSTIN}
          onChange={formik.handleChange}
          error={formik.touched.GSTIN && Boolean(formik.errors.GSTIN)}
          helperText={formik.touched.GSTIN && formik.errors.GSTIN}
        />
        <TextField
          fullWidth
          id="PAN"
          name="PAN"
          label="PAN"
          value={formik.values.PAN}
          onChange={formik.handleChange}
          error={formik.touched.PAN && Boolean(formik.errors.PAN)}
          helperText={formik.touched.PAN && formik.errors.PAN as string}
        />
        <TextField
          fullWidth
          id="businessType"
          name="businessType"
          label="Business Type"
          select
          SelectProps={{ native: true }}
          value={formik.values.businessType}
          onChange={formik.handleChange}
          error={formik.touched.businessType && Boolean(formik.errors.businessType)}
          helperText={formik.touched.businessType && formik.errors.businessType as string}
        >
          <option value="SOLE_PROPRIETOR">Sole Proprietor</option>
          <option value="PARTNERSHIP">Partnership</option>
          <option value="LLC">LLC</option>
          <option value="PRIVATE_LIMITED">Private Limited</option>
          <option value="PUBLIC_LIMITED">Public Limited</option>
        </TextField>
        <Button
          sx={{ py: ".9rem" }}
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </>
  );
};

export default BusinessDetailsForm;