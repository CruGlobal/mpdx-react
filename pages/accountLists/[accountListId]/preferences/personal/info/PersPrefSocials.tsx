import { Link, List, ListItem, styled } from "@material-ui/core";
import { Facebook, Language, LinkedIn, Twitter } from "@material-ui/icons";

const StyledList = styled(List)({
  fontSize: "0",
});

const StyledListItem = styled(ListItem)(({ theme }) => ({
  display: "inline-block",
  width: "auto",
  marginRight: theme.spacing(1),
  padding: "0",
  "&:last-child": {
    marginRight: "0",
  },
}));

const StyledAnchor = styled(Link)({
  display: "block",
  fontSize: "0",
});

const profileTypes = {
  facebook: {
    link: "https://www.facebook.com/",
    icon: <Facebook />,
  },
  twitter: {
    link: "https://www.twitter.com/",
    icon: <Twitter />,
  },
  linkedin: {
    link: "",
    icon: <LinkedIn />,
  },
  websites: {
    link: "",
    icon: <Language />,
  },
};

const ListItemLinks = ({ data, type }) => {
  const { link, icon } = profileTypes[type];

  return data.map((account) => (
    <StyledListItem key={`${type}-${account}`} disableGutters>
      <StyledAnchor href={`${link}${account}`} target="_blank" underline="none">
        {icon}
      </StyledAnchor>
    </StyledListItem>
  ));
};

export const PersPrefSocials = ({
  facebook_accounts,
  twitter_accounts,
  linkedin_accounts,
  websites,
}) => {
  return (
    <StyledList disablePadding>
      <ListItemLinks data={facebook_accounts} type="facebook" />
      <ListItemLinks data={twitter_accounts} type="twitter" />
      <ListItemLinks data={linkedin_accounts} type="linkedin" />
      <ListItemLinks data={websites} type="websites" />
    </StyledList>
  );
};
