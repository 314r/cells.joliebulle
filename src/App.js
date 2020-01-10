import React, { useState, useEffect } from 'react'
import './App.css'
import DryConf from './DryConf.js'
import LiquidConf from './LiquidConf.js'
import { ThemeProvider } from 'emotion-theming'
import theme from '@rebass/preset'
import {
  Box,
  Text,
  Flex,
  Heading,
  Link
} from 'rebass'
import {
  Label,
  Input,
  Radio
} from '@rebass/forms'

const nanoid = require('nanoid')
// suggested rates
// design

function App () {
  const updateList = (itemList, updatedItem) =>
    itemList.map(item => ((item.id === updatedItem.id) ? updatedItem : item))

  const deleteItem = (itemList, itemToDel) =>
    itemList.filter(item => (item.id !== itemToDel.id))

  const sgToPlato = (sg) => (((182.4601 * sg - 775.6821) * sg + 1262.7794) * sg - 669.5622) / 1.04
  const pitchTarget = (sg, volumeL, rate) => sgToPlato(sg) * volumeL * rate
  const pitchRateCalc = (sg, volumeL, cells) => cells / sgToPlato(sg) / (volumeL)
  const pitchSpreadCalc = (target, cells) => target - cells

  // liquid
  const viableCells = (age, cells) => cells - (cells * 0.05 * age)
  // dry
  const dryCells = (weight, billionsPerGram) => weight * billionsPerGram

  const newCellsStir = (cells, dme) => {
    if (cells / dme < 1.4) {
      return 1.4 * dme
    } else if (cells / dme > 1.4 && cells / dme < 3.5) {
      return (2.33 - 0.67 * (cells / dme)) * dme
    } else {
      return 0
    }
  }
  const newCellsNoStir = (cells, dme) => {
    if (cells / dme < 3.5) {
      return 0.4 * dme
    } else {
      return 0
    }
  }
  const totalCells = (cells, newCells) => cells + newCells
  const dmeQty = (target, volume) => (target - 1) * 1000 * 2.73 * volume

  const [size, setSize] = useState(30)
  const [gravity, setGravity] = useState(1.060)
  const [pitchRateTarget, setPitchRateTarget] = useState(1)
  const [type, setType] = useState('liquid')
  const [cellsPerPack, setCellsPerPack] = useState(100)
  const [age, setAge] = useState(1)
  const [dryWeight, setDryWeight] = useState(11)

  const [cellsPitched, setCellsPitched] = useState(0)
  const [targetCells, setTargetCells] = useState(0)
  const [pitchRateBase, setPitchRateBase] = useState(0)
  const [pitchSpread, setPitchSpread] = useState(0)

  const [starters, setStarters] = useState([])

  const onGravityChanged = e => {
    setGravity(parseFloat(e.target.value))
  }
  const onSizeChanged = e => {
    setSize(parseFloat(e.target.value))
  }
  const onRateTargetChanged = e => {
    setPitchRateTarget(parseFloat(e.target.value))
  }
  const onTypeChanged = e => {
    console.log(e.target.value)
    setType(e.target.value)
  }
  const onCellsPerPackChanged = e => {
    setCellsPerPack(parseFloat(e.target.value))
  }
  const onAgeChanged = e => {
    setAge(parseFloat(e.target.value))
    setCellsPitched(viableCells(parseFloat(e.target.value), cellsPerPack))
  }
  const onDryWeightChanged = e => setDryWeight(parseFloat(e.target.value))

  useEffect(() => {
    setTargetCells(pitchTarget(gravity, size, pitchRateTarget))
  }, [gravity, size, pitchRateTarget, pitchTarget])

  useEffect(() => {
    if (type === 'liquid') {
      setCellsPitched(viableCells(age, cellsPerPack))
    } else if (type === 'dry') {
      setCellsPitched(dryCells(dryWeight, 10))
    }
  }, [age, cellsPerPack, dryWeight, type])

  useEffect(() => {
    setPitchRateBase(pitchRateCalc(gravity, size, cellsPitched))
  }, [gravity, size, cellsPitched, pitchRateCalc])

  useEffect(() => {
    const spread = pitchSpreadCalc(targetCells, cellsPitched)
    if (spread <= 0) {
      setStarters([])
    }
    setPitchSpread(spread)
  }, [targetCells, cellsPitched])

  useEffect(() => {
    console.log(starters)
  }, [starters])

  useEffect(() => {
    generateStarter()
  }, [cellsPitched])

  useEffect(() => {
    const newStarters = [...starters]
    if (newStarters.length === 2) {
      if (newStarters[0].total >= targetCells) {
        newStarters.pop()
        setStarters(newStarters)
      }
    } else if (newStarters.length === 1) {
      if (newStarters[0].total < targetCells) {
        generateStarter2(newStarters[0])
      }
    } else if (newStarters.length === 0) {
      generateStarter()
    }
  })

  const onStarterSizeChanged = (index, e) => {
    const newSize = parseFloat(e.target.value)
    const newStarter = { ...starters[index] }
    newStarter.size = newSize
    newStarter.dme = dmeQty(newStarter.gravity, newSize)
    if (index === 0) {
      newStarter.newCells = newCellsStir(cellsPitched, newStarter.dme)
      newStarter.total = totalCells(cellsPitched, newStarter.newCells)
      newStarter.rate = pitchRateCalc(gravity, size, newStarter.total)
      generateStarter2(newStarter)
    }
    if (index === 1) {
      newStarter.newCells = newCellsStir(starters[0].total, newStarter.dme)
      newStarter.total = totalCells(starters[0].total, newStarter.newCells)
      newStarter.rate = pitchRateCalc(gravity, size, newStarter.total)
      setStarters(updateList([...starters], newStarter))
    }
  }

  const onStarterGravityChanged = (index, e) => {
    const newGravity = parseFloat(e.target.value)
    const newStarter = { ...starters[index] }
    newStarter.gravity = newGravity
    newStarter.dme = dmeQty(newGravity, newStarter.size)
    if (index === 0) {
      newStarter.newCells = newCellsStir(cellsPitched, newStarter.dme)
      newStarter.total = totalCells(cellsPitched, newStarter.newCells)
      newStarter.rate = pitchRateCalc(gravity, size, newStarter.total)
      generateStarter2(newStarter)
    }
    if (index === 1) {
      newStarter.newCells = newCellsStir(starters[0].total, newStarter.dme)
      newStarter.total = totalCells(starters[0].total, newStarter.newCells)
      newStarter.rate = pitchRateCalc(gravity, size, newStarter.total)
      setStarters(updateList([...starters], newStarter))
    }
  }

  const generateStarter = () => {
    if (pitchSpread > 0) {
      const dme = dmeQty(1.037, 2)
      const newCells = newCellsStir(cellsPitched, dme)
      const total = totalCells(cellsPitched, newCells)
      const rate = pitchRateCalc(gravity, size, total)
      const newStarter = {
        id: nanoid(),
        size: 2,
        gravity: 1.037,
        dme,
        newCells,
        total,
        rate
      }
      setStarters([newStarter])
      if (newStarter.total < targetCells) {
        const dme = dmeQty(1.037, 2)
        const newCells = newCellsStir(newStarter.total, dme)
        const total = totalCells(newStarter.total, newCells)
        const rate = pitchRateCalc(gravity, size, total)
        const starter2 = {
          id: nanoid(),
          size: 2,
          gravity: 1.037,
          dme,
          newCells,
          total,
          rate
        }
        const generatedStarters = [newStarter].concat([starter2])
        setStarters(generatedStarters)
      }
    }
  }

  const generateStarter2 = (starter1) => {
    if (starter1.total < targetCells && starters.length > 1) {
      const id = starters[1].id
      const starterGravity = starters[1].gravity
      const starterSize = starters[1].size
      const dme = starters[1].dme
      const newCells = newCellsStir(starter1.total, dme)
      const total = totalCells(starter1.total, newCells)
      const rate = pitchRateCalc(gravity, size, total)
      const starter2 = { id, size: starterSize, gravity: starterGravity, dme, newCells, total, rate }
      const newStarters = [starter1].concat(starter2)
      setStarters(newStarters)
    } else if (starter1.total < targetCells && starters.length === 1) {
      const id = nanoid()
      const starterGravity = 1.037
      const starterSize = 2
      const dme = dmeQty(1.037, 2)
      const newCells = newCellsStir(starter1.total, dme)
      const total = totalCells(starter1.total, newCells)
      const rate = pitchRateCalc(gravity, size, total)
      const starter2 = { id, size: starterSize, gravity: starterGravity, dme, newCells, total, rate }
      const newStarters = [starter1].concat(starter2)
      setStarters(newStarters)
    } else {
      setStarters([starter1])
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box p={5}>

        <Box as='form'
          pt={3}
          fontWeight={500}
          onSubmit={e => e.preventDefault()}>
          <Flex>
            <Flex width={1 / 3} flexDirection='column' pr={4}>
              <Box>
                <Text fontWeight='bold' pt={3}>Batch details</Text>
                <hr style={{ border: 'none', height: '1px', borderWidth: '1px', borderRadius: '1px', backgroundColor: 'rgb(211, 211, 211)' }} />
              </Box>
              <Flex alignItems='center' width={1} mt={3}>
                <Label width={1 / 4}>Size (L)</Label>
                <Input
                  width={1 / 4}
                  type='number'
                  min='1'
                  step='1'
                  defaultValue='30'
                  onChange={e => onSizeChanged(e)}
                />
              </Flex>
              <Flex alignItems='center' width={1} mt={3} >
                <Label width={1 / 4}>Gravity</Label>
                <Input
                  width={1 / 4}
                  type='number'
                  min='1.000'
                  step='0.01'
                  defaultValue='1.060'
                  onChange={e => onGravityChanged(e)}
                />
              </Flex>
            </Flex>
            <Flex width={1 / 3} mb={5} flexDirection='column' pr={4}>
              <Box>
                <Text fontWeight='bold' pt={3}>Pitching rate</Text>
                <hr style={{ border: 'none', height: '1px', borderWidth: '1px', borderRadius: '1px', backgroundColor: 'rgb(211, 211, 211)' }} />
              </Box>

              <Flex alignItems='center' width={1} mt={3} >
                <Label width={1 / 4}>Target Rate</Label>
                <Input
                  width={1 / 8}
                  type='number'
                  min='0.35'
                  step='0.15'
                  defaultValue='1'
                  onChange={e => onRateTargetChanged(e)}
                />
              </Flex>
            </Flex>
            <Box width={1 / 3}>
              <Box>
                <Text fontWeight='bold' mb={2} pt={3}>Yeast Type</Text>
                <hr style={{ border: 'none', height: '1px', borderWidth: '1px', borderRadius: '1px', backgroundColor: 'rgb(211, 211, 211)' }} />
              </Box>

              <Flex mx={-2}>
                <Label width={1 / 2} pt={3} pl={2}>
                  <Radio
                    id='liquid'
                    name='type'
                    value='liquid'
                    defaultChecked
                    onChange={e => onTypeChanged(e)}
                  />
      Liquid
                </Label>
                <Label width={1 / 4} p={2}>
                  <Radio
                    id='dry'
                    name='type'
                    value='dry'
                    onChange={e => onTypeChanged(e)}
                  />
      Dry
                </Label>
              </Flex>
              {
                type === 'liquid'
                  ? <LiquidConf
                    onCellsPerPackChanged={e => onCellsPerPackChanged(e)}
                    onAgeChanged={e => onAgeChanged(e)}
                  />
                  : <DryConf onDryWeightChanged={e => onDryWeightChanged(e)} />
              }
            </Box>
          </Flex>

          <Box py={4} fontSize={1} mt={3} fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Flex>
              <Text width={1 / 4}>Target cells count: </Text> <Text>{Math.round(targetCells)} billions</Text>
            </Flex>
            <Flex py={3}>
              <Text width={1 / 4}>Actual cells count: </Text> <Text color='#FF00AA'>{Math.round(cellsPitched)} Billions ({Math.round(pitchRateBase * 100) / 100}M cells/ml/°P)</Text>
            </Flex>
            <Flex>
              <Text width={1 / 4}>Difference: </Text> <Text>{Math.round(pitchSpread)} Billons</Text>
            </Flex>
          </Box>
        </Box>
        <Heading pt={5}>⚙️&nbsp;Starters</Heading>
        {pitchSpread < 0 && <Text fontWeight={500} pt={4}>🎁&nbsp;Not required</Text> }
        {starters.map((step, index) => (

          <Box key={index} mt={4}>
            <Box as='form'
              pt={3}
              width={1 / 3}
              pr={4}
              fontWeight={500}
              onSubmit={e => e.preventDefault()}>
              <Text fontWeight='bold'>Step {index + 1}</Text>
              <hr style={{ border: 'none', height: '1px', borderWidth: '1px', borderRadius: '1px', backgroundColor: 'rgb(211, 211, 211)' }} />
              <Flex width={1} flexDirection='column' pt={3}>
                <Flex alignItems='center' width={1} >
                  <Label width={1 / 4}>Volume (L)</Label>
                  <Input
                    width={1 / 4}
                    type='number'
                    min='0'
                    step='0.1'
                    defaultValue='2'
                    onChange={e => onStarterSizeChanged(index, e)}
                  />
                </Flex>

                <Flex alignItems='center' width={1} pt={3}>
                  <Label width={1 / 4} >Gravity</Label>
                  <Input
                    width={1 / 4}
                    type='number'
                    min='1'
                    step='0.001'
                    defaultValue='1.037'
                    onChange={e => onStarterGravityChanged(index, e)}
                  />
                </Flex>
              </Flex>
            </Box>
            <Box sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} fontWeight='bold' fontSize={1} pb={4}>
              <Flex mt={4} >
                <Text width={1 / 4}>DME needed</Text> <Text >{Math.round(starters[index].dme)}g</Text>
              </Flex>
              <Flex>
                <Text width={1 / 4}>New cells</Text> <Text>{Math.round(starters[index].newCells)} Billions</Text>
              </Flex>
              <Flex>
                <Text width={1 / 4} >Total cells count </Text> <Text color='#FF00AA'>{Math.round(starters[index].total)} Billions</Text>
              </Flex>
            </Box>
          </Box>
        )
        )}
      </Box>
    </ThemeProvider>
  )
}

export default App
