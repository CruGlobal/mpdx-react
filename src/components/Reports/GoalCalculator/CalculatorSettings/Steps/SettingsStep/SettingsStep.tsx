import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import theme from 'src/theme';

interface SettingBoxProps {
  imageNumber: number;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
}

const SettingBox: React.FC<SettingBoxProps> = ({
  imageNumber,
  description,
  imageSrc,
  imageAlt,
}) => (
  <Box
    sx={{
      // Responsive width
      width: { xs: '140px', sm: '160px', md: '200px' },
      // Responsive height
      height: { xs: '140px', sm: '160px', md: '200px' },
      border: '1px solid',
      borderRadius: 1,
      borderColor: theme.palette.mpdxGray.main,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      // Responsive margin
      m: { xs: 1, sm: 1.5, md: 2 },
      // Responsive padding
      p: { xs: 1, sm: 1.5, md: 2 },
      cursor: 'pointer',
      '&:hover': {
        borderColor: theme.palette.mpdxBlue.main,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }}
  >
    {imageSrc ? (
      <Box
        component="img"
        src={imageSrc}
        alt={imageAlt || `Image ${imageNumber}`}
        sx={{
          // Responsive width
          width: { xs: '80px', sm: '100px', md: '120px' },
          // Responsive height
          height: { xs: '80px', sm: '100px', md: '120px' },
          objectFit: 'cover',
          borderRadius: 1,
          mb: 1,
        }}
      />
    ) : (
      <Box
        sx={{
          // Responsive width
          width: { xs: '80px', sm: '100px', md: '120px' },
          // Responsive height
          height: { xs: '80px', sm: '100px', md: '120px' },
          backgroundColor: theme.palette.cruGrayLight.main,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        <Typography
          variant="h4"
          color="textSecondary"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
        >
          {imageNumber}
        </Typography>
      </Box>
    )}
    <Typography
      variant="body1"
      textAlign="center"
      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
    >
      {description.toUpperCase()}
    </Typography>
  </Box>
);

const settingBoxes = [
  {
    description: 'Create a Goal for Now',
    // Add your image path here
    imageSrc: '/images/goal-calculator/goal-calculator-now.png',
    imageAlt: 'Create a Goal for Now',
  },
  {
    description: 'Create a Goal for the Future',
    // Add your image path here
    imageSrc: '/images/goal-calculator/goal-calculator-future.png',
    imageAlt: 'Create a Goal for the Future',
  },
];

const detailBoxes = [
  {
    description: 'Short & Simple',
    // Add your image path here
    imageSrc: '/images/goal-calculator/goal-calculator-short.png',
    imageAlt: 'Short & Simple',
  },
  {
    description: 'Long & Precise',
    // Add your image path here
    imageSrc: '/images/goal-calculator/goal-calculator-long.png',
    imageAlt: 'Long & Precise',
  },
];

export const SettingsStep: React.FC = () => {
  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.5, md: 2 }, // Responsive padding
      }}
    >
      <Container disableGutters>
        <Box sx={{ marginBottom: { xs: 1, sm: 1.5, md: 2 } }}>
          <Typography
            sx={{
              flex: '1 1 100%',
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1rem' },
              mb: { xs: 1, md: 0 },
            }}
          >
            Is this goal for now or later?
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', sm: 'flex-start' },
              mb: 2, // Increased gap between squares
              flexWrap: 'wrap',
              flexDirection: { xs: 'column', sm: 'row' }, // Column on mobile, row on small+ screens for 2 per row
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: { xs: 1, sm: 0 },
              maxWidth: { sm: 'fit-content' }, // Prevent stretching beyond content width
            }}
          >
            {settingBoxes.map((box, index) => (
              <SettingBox
                key={index}
                imageNumber={index + 1}
                description={box.description}
                imageSrc={box.imageSrc}
                imageAlt={box.imageAlt}
              />
            ))}
          </Box>
          <Typography
            sx={{
              flex: '1 1 100%',
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1rem' },
              mb: { xs: 1, md: 0 },
            }}
          >
            How detailed do you need to be?
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', sm: 'flex-start' },
              flexWrap: 'wrap',
              flexDirection: { xs: 'column', sm: 'row' }, // Column on mobile, row on small+ screens for 2 per row
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: { xs: 1, sm: 0 },
              maxWidth: { sm: 'fit-content' }, // Prevent stretching beyond content width
            }}
          >
            {detailBoxes.map((box, index) => (
              <SettingBox
                key={index}
                imageNumber={index + 1}
                description={box.description}
                imageSrc={box.imageSrc}
                imageAlt={box.imageAlt}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
