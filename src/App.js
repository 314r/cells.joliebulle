import React, { useState, useEffect } from 'react'
import './App.css'
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
  Input
} from '@rebass/forms'

const nanoid = require('nanoid')

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

  const starterTemplate = { dme: 0, gravity: 0, mode: 'stir' }

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
  const [useStarter, setUseStarter] = useState(true)
  const [useAnotherStarter, setUseAnotherStarter] = useState(false)

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
    setType(e.target.value)
  }
  const onCellsPerPackChanged = e => {
    setCellsPerPack(parseFloat(e.target.value))
  }
  const onAgeChanged = e => {
    setAge(parseFloat(e.target.value))
    setCellsPitched(viableCells(parseFloat(e.target.vlaue), cellsPerPack))
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
    setPitchSpread(pitchSpreadCalc(targetCells, cellsPitched))
  }, [targetCells, cellsPitched])

  useEffect(() => {
    // pitchSpread > 0 ? setUseStarter(true) : setUseStarter(false)
    // console.log(useStarter)
    if (pitchSpread > 0 && useStarter) {
      const dme = dmeQty(1.037, 2)
      const newCells = newCellsStir(cellsPitched, dme)
      const total = totalCells(cellsPitched, newCells)
      const rate = pitchRateCalc(1.037, 2, total)
      const newStarter = {
        id: nanoid(),
        size: 2,
        gravity: 1.037,
        dme,
        newCells,
        total,
        rate
      }
      setUseStarter(false)
      setStarters(starters.concat([newStarter]))
      newStarter.total < targetCells ? setUseAnotherStarter(true) : setUseAnotherStarter(false)
    }
  }, [pitchSpread, starters, cellsPitched, targetCells, useStarter, pitchRateCalc])

  useEffect(() => {
    console.log(starters)
  }, [starters])

  const onStarterSizeChanged = (index, e) => {
    const newSize = parseFloat(e.target.value)
    const newStarter = { ...starters[index] }
    newStarter.size = newSize
    newStarter.dme = dmeQty(newStarter.gravity, newSize)
    newStarter.newCells = newCellsStir(cellsPitched, newStarter.dme)
    newStarter.total = totalCells(cellsPitched, newStarter.newCells)
    newStarter.rate = pitchRateCalc(newStarter.gravity, newSize, newStarter.total)

    setStarters(updateList(starters, newStarter))
    newStarter.total < targetCells ? setUseAnotherStarter(true) : setUseAnotherStarter(false)
  }

  useEffect(() => {
    if (useAnotherStarter) {
      const lastStarter = [...starters].pop()
      console.log(lastStarter)
      const dme = dmeQty(1.037, 2)
      const newCells = newCellsStir(lastStarter.total, dme)
      console.log(newCells)
      const total = totalCells(lastStarter.total, newCells)
      const rate = pitchRateCalc(1.037, 2, total)
      const newStarter = {
        id: nanoid(),
        size: 2,
        gravity: 1.037,
        dme,
        newCells,
        total,
        rate
      }
      newStarter.total < targetCells ? setUseAnotherStarter(true) : setUseAnotherStarter(false)
      setStarters(starters.concat([newStarter]))
    } else {

    }
  }, [useAnotherStarter, pitchRateCalc, starters, targetCells])

  return (
    <ThemeProvider theme={theme}>
      <Box p={5}>
        <Heading pt={3}>Pitching rate</Heading>
        <Box>
          <Flex>
            <Text>Target cells count: </Text> <Text>{Math.round(targetCells)}M</Text>
          </Flex>
          <Flex>
            <Text>Actual cells count: </Text> <Text>{Math.round(cellsPitched)} ({Math.round(pitchRateBase * 100) / 100}M cells/ml/°P)</Text>
          </Flex>
          <Flex>
            <Text>Difference: </Text> <Text>{Math.round(pitchSpread)}M</Text>
          </Flex>
        </Box>
        <Heading pt={3}>Starter</Heading>
        {starters.map((step, index) => (
          <Box key={index} mt={5}>
            <Text fontWeight='bold'>Step {index + 1}</Text>
            <Box as='form'
              pt={3}
              onSubmit={e => e.preventDefault()}>
              <Flex width={1}>
                <Flex alignItems='center' width={1} >
                  <Label width={1 / 4}>Starter volume</Label>
                  <Input
                    width={1 / 4}
                    type='number'
                    min='0'
                    step='0.1'
                    defaultValue='2'
                    onChange={e => onStarterSizeChanged(index, e)}
                  />
                </Flex>

                <Flex alignItems='center' width={1} >
                  <Label width={1 / 4} >Starter gravity</Label>
                  <Input
                    width={1 / 4}
                    type='number'
                    min='1'
                    step='0.001'
                    defaultValue='1.037'

                  />
                </Flex>
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
