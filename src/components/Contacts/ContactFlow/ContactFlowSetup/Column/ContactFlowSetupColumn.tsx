import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  styled,
} from '@material-ui/core';
import { Menu, Clear, FiberManualRecord } from '@material-ui/icons';
import theme from '../../../../../../src/theme';
import { ContactFilterStatusEnum } from '../../../../../../graphql/types.generated';
import { colorMap } from '../../../../../../src/components/Contacts/ContactFlow/ContactFlow';

export const ContactFlowSetupStatusRow = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
  '&:hover': {
    backgroundColor: theme.palette.mpdxYellow.main,
    cursor: 'move',
  },
}));

interface Props {
  statuses: ContactFilterStatusEnum[];
  title: string;
  color: string;
  accountListId: string;
  index: number;
  changeColor: (index: number, color: string) => void;
  changeTitle: (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
  deleteColumn: (index: number) => void;
}

export const ContactFlowSetupColumn: React.FC<Props> = ({
  statuses,
  title,
  color,
  index,
  changeColor,
  changeTitle,
  deleteColumn,
}: Props) => {
  return (
    <>
      <Card>
        <Box
          p={2}
          pr={0}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          data-testid="column-header"
          borderBottom={`5px solid ${color}`}
          height={theme.spacing(7)}
        >
          <Menu />
          <TextField
            fullWidth
            value={title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              changeTitle(event, index)
            }
            style={{
              marginLeft: theme.spacing(1),
              marginRight: theme.spacing(1),
            }}
          />
          <IconButton onClick={() => deleteColumn(index)}>
            <Clear style={{ color: theme.palette.error.main }} />
          </IconButton>
        </Box>
        <CardContent
          style={{
            position: 'relative',
            height: 'calc(100vh - 230px)',
            padding: 0,
            background: theme.palette.cruGrayLight.main,
            overflowY: 'auto',
          }}
        >
          <Box width="100%" height="100%">
            <Box
              width="100%"
              display="flex"
              justifyContent="center"
              borderBottom={`1px solid ${theme.palette.cruGrayMedium.main}`}
              style={{ backgroundColor: theme.palette.common.white }}
            >
              {Object.entries(colorMap).map(([colorKey, colorValue]) => {
                return (
                  <IconButton
                    key={colorKey}
                    onClick={() => changeColor(index, colorKey)}
                  >
                    <FiberManualRecord
                      style={{
                        color: colorValue,
                        height:
                          color === colorValue
                            ? theme.spacing(4)
                            : theme.spacing(2.5),
                        width:
                          color === colorValue
                            ? theme.spacing(4)
                            : theme.spacing(2.5),
                      }}
                    />
                  </IconButton>
                );
              })}
            </Box>
            <Box style={{ backgroundColor: theme.palette.common.white }}>
              {statuses.map((status) => (
                <ContactFlowSetupStatusRow key={status}>
                  <Typography>{status}</Typography>
                </ContactFlowSetupStatusRow>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
