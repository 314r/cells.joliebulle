import React from 'react'
import {
  Box,
  Flex
} from 'rebass'
import {
  Label,
  Radio
} from '@rebass/forms'

function ModeRadio ({ setMode }) {
  return (
    <Box as='form'
      onSubmit={e => e.preventDefault()} >
      <Flex mx={-2} width={[1, 1 / 4, 1 / 4]}>
        <Label width={1 / 2} pt={3} pl={2}>
          <Radio
            id='stir'
            name='mode'
            value='stir'
            defaultChecked
            onChange={() => setMode('stir')}
          />
      Stir
        </Label>
        <Label width={1 / 2} pt={3}>
          <Radio
            id='noStir'
            name='mode'
            value='noStir'
            onChange={() => setMode('noStir')}
          />
      No stir
        </Label>
      </Flex>
    </Box>
  )
}

export default ModeRadio
