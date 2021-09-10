import { Link, Typography, styled } from "@material-ui/core";
import { Check } from "@material-ui/icons";

const StyledCheck = styled(Check)(({ theme }) => ({
  verticalAlign: "top",
  color: theme.palette.mpdxGreen.main,
  position: "relative",
  top: "-3px",
}));

const isEmail = (obj) => ("address" in obj ? true : false);

export const PersPrefContact = ({ data }) => {
  const prefix = isEmail(data) ? "mailto" : "tel";
  const value = data.value;

  return (
    <Typography gutterBottom>
      <Link href={`${prefix}:${value}`}>{value}</Link>{" "}
      <span style={{ textTransform: "capitalize" }}>- {data.type} </span>
      {/* {data.primary ? <StyledCheck /> : ""} */}
    </Typography>
  );
};
