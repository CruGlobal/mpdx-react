import { Typography } from "@material-ui/core";

export const PersPrefAnniversary = ({
  marital_status,
  anniversary_day,
  anniversary_month,
}) => {
  const anniversary = anniversary_month || anniversary_day ? true : false;

  let output = "";

  if (marital_status) {
    output += marital_status;
  } else if (anniversary) {
    output += "Anniversary";
  }

  if (anniversary) {
    output += ": ";
    if (anniversary_month) {
      output += `${anniversary_month} `;
    }
    if (anniversary_day) {
      output += anniversary_day;
    }
  }

  if (output !== "") {
    return <Typography gutterBottom>{output}</Typography>;
  }

  return null;
};
