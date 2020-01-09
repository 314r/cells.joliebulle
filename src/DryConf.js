import React from 'react'
import {
  Box,
  Flex
} from 'rebass'
import {
  Label,
  Input
} from '@rebass/forms'

function DryConf ({ onDryWeightChanged }) {
  return (
    <Box as='form'
      pt={3}
      onSubmit={e => e.preventDefault()} >

      <Flex alignItems='center' width={1 / 2} >
        <Label width={1 / 2}>Yeast amount (grams)</Label>
        <Input
          width={1 / 4}
          type='number'
          min='1'
          step='1'
          defaultValue='11'
          onChange={e => onDryWeightChanged(e)}
        />
      </Flex>
    </Box>
  )
}

export default DryConf
