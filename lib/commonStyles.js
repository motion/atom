// strength goes from 0 to 100

export default {
  color: {
    description: `Sets the text color`,
    default: '#333333'
    strength: 100,
  },

  margin: {
    description: `Spacing around an element`,
    default: 10,
    strength: 100,
  },

  flexDirection: {
    description: `Row or Column, sets direction element flows in`,
    options: ['row', 'col'],
  },

  height: {
    default: 300,
    strength: 80,
    options: [300, '100%'],
  },

  width: {
    default: 300,
    strength: 80,
    options: [300, '100%'],
  },

  border: {
    default: '1px solid #333',
    strength: 100,
  },

  background: {
    default: '#eee',
    strength: 100,
  },

  textAlign: {
    default: 'center',
    options: ['left', 'center', 'right'],
    strength: 80,
  }

  fontSize: {
    description: `Sets size of text`,
    default: 24,
    strength: 100,
  },

  padding: {
    description: `Spacing inside an element`,
    default: 10,
    strength: 100,
  },
}
