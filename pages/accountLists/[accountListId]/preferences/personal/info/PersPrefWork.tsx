import { Typography } from "@material-ui/core";

export const PersPrefWork = ({ employer, occupation }) => {
  const separator = occupation && employer ? " - " : "";

  if (occupation || employer) {
    return (
      <Typography gutterBottom>
        {occupation} {separator} {employer}
      </Typography>
    );
  }

  return null;
};
