import React from 'react'
import {
  Box,
  Text,
  Flex
} from 'rebass'
import {
  Label,
  Input,
  Radio
} from '@rebass/forms'

function LiquidConf ({ onCellsPerPackChanged, onAgeChanged }) {
  return (

    <Box as='form'
      pt={3}
      onSubmit={e => e.preventDefault()} >
      <Flex alignItems='center' width={1 / 2} >
        <Label width={1 / 2}>Original Cell Count (Billions)</Label>
        <Input
          width={1 / 4}
          type='number'
          min='1'
          step='10'
          defaultValue='100'
          onChange={e => onCellsPerPackChanged(e)}
        />
      </Flex>
      <Flex alignItems='center' width={1 / 2} mt={2} mb={4}>
        <Label width={1 / 2}>Age (months)</Label>
        <Input
          width={1 / 4}
          type='number'
          min='0'
          step='1'
          defaultValue='1'
          onChange={e => onAgeChanged(e)}
        />
      </Flex>
    </Box>
  )
}

export default LiquidConf
