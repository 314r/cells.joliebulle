import React from 'react'
import {
  Box,
  Flex
} from 'rebass'
import {
  Label,
  Input
} from '@rebass/forms'

function LiquidConf ({ onCellsPerPackChanged, onAgeChanged }) {
  return (

    <Box as='form'
      pt={3}
      mb={3}
      onSubmit={e => e.preventDefault()}
      width={1}
    >
      <Flex alignItems='center' width={1} mt={3} >
        <Label width={1 / 2}>Original Cell Count</Label>
        <Input
          width={1 / 4}
          type='number'
          min='1'
          step='10'
          defaultValue='100'
          onChange={e => onCellsPerPackChanged(e)}
        />
      </Flex>
      <Flex alignItems='center' width={1} mt={3}>
        <Label width={1 / 2}>Age (months)</Label>
        <Input
          width={1 / 8}
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
