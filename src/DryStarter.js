import React from 'react'
import {
  Box,
  Text
} from 'rebass'

function DryStarter (props) {
  return (
    <Box my={3} fontWeight={500}>
      <Text width={[1, 1 / 2, 1 / 4]} py={1} px={3} backgroundColor='#e34850' color='white' style={{ borderRadius: '4px' }}>You should not use a starter with dry yeast. Add 1 or more packets.</Text>
    </Box>
  )
}

export default DryStarter
