import {
  Box,
  DialogActions,
  Divider,
  Grid,
  GridProps,
  Hidden,
  IconButton,
  Typography,
  styled,
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';

export const SectionHeading = styled(Typography)(() => ({
  fontWeight: 700,
  lineHeight: 1,
  display: 'block',
}));

const SmallColumnLabels = styled(Grid)(({ _, align }) => ({
  display: 'flex',
  justifyContent: align === 'left' ? 'flex-start' : 'center',
  alignItems: 'flex-end',
  '& span': {
    fontSize: '0.6875em',
    lineHeight: 1,
  },
}));

interface OptionHeadingsProps {
  smallCols: boolean | GridProps['GridSize'] | undefined;
  align: string;
}

export const OptionHeadings: React.FC<OptionHeadingsProps> = ({
  smallCols,
  align,
  children,
}) => (
  <SmallColumnLabels item sm={smallCols} align={align}>
    <Typography component="span">{children}</Typography>
  </SmallColumnLabels>
);

export const EmptyIcon = ({ size = 24 }) => {
  return (
    <span
      style={{ width: `${size}px`, height: `${size}px`, display: 'block' }}
    ></span>
  );
};

const btnBorder = '1px solid rgba(0, 0, 0, 0.23)';

export const StyledGridContainer = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    border: btnBorder,
    borderRadius: theme.shape.borderRadius,
    "&[class*='WithStyles']": {
      marginTop: theme.spacing(1),
      "& + [class*='WithStyles']": {
        marginTop: theme.spacing(3),
      },
    },
  },
}));

export const StyledGridItem = styled(Grid)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '& .MuiButtonBase-root': {
    border: btnBorder,
    borderRadius: 4,
    padding: 9,
  },
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'center',
  },
}));

export const HiddenSmLabel = ({ children }) => (
  <Hidden smUp>
    <Typography component="span">{children}</Typography>
  </Hidden>
);

export const DeleteButton = () => (
  <>
    <HiddenSmLabel>Delete</HiddenSmLabel>
    <IconButton disableRipple>
      <Delete />
    </IconButton>
  </>
);

export const AddButtonBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  [theme.breakpoints.up('sm')]: { marginTop: theme.spacing(1) },
}));

export const StyledDivider = styled(Divider)(
  ({ marginTop = null, marginBottom = null, marginY = 3, theme }) => {
    return {
      marginTop: theme.spacing(marginTop ? marginTop : marginY),
      marginLeft: 0,
      marginRight: 0,
      marginBottom: theme.spacing(marginBottom ? marginBottom : marginY),
    };
  },
);

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
}));
