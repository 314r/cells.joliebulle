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
      setStarters(starters.concat([newStarter]))
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
        setStarters(starters.concat(generatedStarters))
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
        <Heading pt={3}>Pitching rate</Heading>
        <Box as='form'
          pt={3}
          onSubmit={e => e.preventDefault()}>
          <Flex width={1}>
            <Flex alignItems='center' width={1} >
              <Label width={1 / 4}>Target Pitching Rate</Label>
              <Input
                width={1 / 4}
                type='number'
                min='0.35'
                step='0.15'
                defaultValue='1'
                onChange={e => onRateTargetChanged(e)}
              />
            </Flex>
            <Flex alignItems='center' width={1} >
              <Label width={1 / 4}>Batch Size</Label>
              <Input
                width={1 / 4}
                type='number'
                min='1'
                step='1'
                defaultValue='30'
                onChange={e => onSizeChanged(e)}
              />
            </Flex>
            <Flex alignItems='center' width={1} >
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
          <Box width={1}>
            <Text fontWeight='bold' mb={2} mt={4}>Yeast Type</Text>
            <Flex mx={-2}>
              <Label width={1 / 4} p={2}>
                <Radio
                  id='liquid'
                  name='type'
                  value='liquid'
                  defaultChecked
                />
      Liquid
              </Label>
              <Label width={1 / 4} p={2}>
                <Radio
                  id='dry'
                  name='type'
                  value='dry'
                />
      Dry
              </Label>
            </Flex>

          </Box>
        </Box>
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
                    onChange={e => onStarterGravityChanged(index, e)}
                  />
                </Flex>
              </Flex>
            </Box>
            <Box>
              <Flex mt={4}>
                <Text width={1 / 4}>DME needed</Text> <Text >{Math.round(starters[index].dme)}g</Text>
              </Flex>
              <Flex>
                <Text width={1 / 4}>New cells</Text> <Text>{Math.round(starters[index].newCells)} Billions</Text>
              </Flex>
              <Flex>
                <Text width={1 / 4}>Total cells count </Text> <Text>{Math.round(starters[index].total)} Billions</Text>
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
