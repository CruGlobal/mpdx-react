import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { StyledOrderedList } from 'src/components/Reports/MinisterHousingAllowance/styledComponents/StyledOrderedList';

interface InitialQuestionsCardProps {
  title: string;
  sectionOneTitle: string;
  sectionFourTitle?: string;
  isFairRental?: boolean;
}

export const InitialQuestionsCard: React.FC<InitialQuestionsCardProps> = ({
  title,
  sectionOneTitle,
  sectionFourTitle,
  isFairRental,
}) => {
  const { t } = useTranslation();

  // TODO: add formik inputs for amounts

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Table
          sx={{
            '& .MuiTableRow-root:last-child td': {
              border: 0,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ color: 'primary.main', fontSize: 16, width: '70%' }}
              >
                {t('Category')}
              </TableCell>
              <TableCell
                sx={{ color: 'primary.main', fontSize: 16, width: '30%' }}
              >
                {t('Amount')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: '70%' }}>
                <StyledOrderedList component="ol" start={1}>
                  <Typography>
                    <li>{sectionOneTitle}</li>
                  </Typography>
                  {!isFairRental && (
                    <Box sx={{ color: 'text.secondary' }}>
                      <Trans i18nKey="fairRentalValueQuestion1">
                        The best way to determine this amount is to have an
                        appraiser or rental real estate specialist provide you
                        with a written estimate of the monthly rental value. If
                        this is not possible, you may estimate it by calculating
                        1% of the value of your home and lot.
                      </Trans>
                    </Box>
                  )}
                </StyledOrderedList>
              </TableCell>
              <TableCell sx={{ width: '30%', color: 'text.secondary' }}>
                <TextField
                  variant="standard"
                  placeholder={t('Enter Amount')}
                  InputProps={{ disableUnderline: true }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ width: '70%' }}>
                <StyledOrderedList component="ol" start={2}>
                  <Typography>
                    <li>
                      {t(
                        'Monthly value for furniture, appliances, decorations, and cleaning.',
                      )}
                    </li>
                  </Typography>
                  {!isFairRental && (
                    <Box sx={{ color: 'text.secondary' }}>
                      <Trans i18nKey="fairRentalValueQuestion2">
                        This is a reasonable amount by which the monthly rental
                        of your home would increase if it were furnished.
                      </Trans>
                    </Box>
                  )}
                </StyledOrderedList>
              </TableCell>
              <TableCell sx={{ width: '30%', color: 'text.secondary' }}>
                <TextField
                  variant="standard"
                  placeholder={t('Enter Amount')}
                  InputProps={{ disableUnderline: true }}
                />
              </TableCell>
            </TableRow>
            {isFairRental && (
              <TableRow>
                <TableCell sx={{ width: '70%' }}>
                  <StyledOrderedList component="ol" start={3}>
                    <Typography>
                      <li>
                        {t(
                          'Estimated monthly cost of repairs and upkeep, include lawn maintenance, pest control, paint, etc.',
                        )}
                      </li>
                    </Typography>
                  </StyledOrderedList>
                </TableCell>
                <TableCell sx={{ width: '30%', color: 'text.secondary' }}>
                  <TextField
                    variant="standard"
                    placeholder={t('Enter Amount')}
                    InputProps={{ disableUnderline: true }}
                  />
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell sx={{ width: '70%' }}>
                <StyledOrderedList component="ol" start={isFairRental ? 4 : 3}>
                  <Typography>
                    <li>{t('Average monthly utility costs.')}</li>
                  </Typography>
                  {isFairRental && (
                    <Box sx={{ color: 'text.secondary' }}>
                      {t('Entered in the previous section.')}
                    </Box>
                  )}
                </StyledOrderedList>
              </TableCell>
              <TableCell sx={{ width: '30%', color: 'text.secondary' }}>
                <TextField
                  variant="standard"
                  placeholder={t('Enter Amount')}
                  InputProps={{ disableUnderline: true }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ width: '70%' }}>
                <StyledOrderedList component="ol" start={isFairRental ? 5 : 4}>
                  <Typography>
                    <li>{sectionFourTitle}</li>
                  </Typography>
                  <Box sx={{ color: 'text.secondary' }}>
                    <Typography variant="body2">
                      {!isFairRental && t('Sum of lines 1-3')}
                    </Typography>
                  </Box>
                </StyledOrderedList>
              </TableCell>
              <TableCell sx={{ width: '30%' }}>
                {isFairRental ? (
                  <TextField
                    variant="standard"
                    placeholder={t('Enter Amount')}
                    InputProps={{ disableUnderline: true }}
                  />
                ) : (
                  t('$0')
                )}
              </TableCell>
            </TableRow>
            {isFairRental && (
              <TableRow>
                <TableCell sx={{ width: '70%' }}>
                  <StyledOrderedList component="ol" start={6}>
                    <Typography>
                      <li>{t('Total Monthly Cost of Providing a Home')}</li>
                    </Typography>
                  </StyledOrderedList>
                </TableCell>
                <TableCell sx={{ width: '30%' }}>{t('$0')}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell sx={{ width: '70%' }}>
                <Typography>
                  <b>{t('Annual Fair Rental Value of your Home')}</b>
                </Typography>
                <Box sx={{ color: 'text.secondary' }}>
                  <Trans i18nKey="fairRentalValueQuestion1">
                    {isFairRental
                      ? 'Line 6 multiplied by 12 months'
                      : 'Line 4 multiplied by 12 months'}
                  </Trans>
                </Box>
              </TableCell>
              <TableCell sx={{ width: '30%' }}>
                <b>{t('$0')}</b>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
