// Computes the cart total the UI should show, in integer cents so 4 x 29.99 + 5.99 is 125.95 and not 125.94999999999999.
// Input (env): LINES, as "price*quantity" pairs separated by commas, e.g. "29.99*3,7.99*2". Optional DELIVERY.
// Output: output.expectedTotal, formatted the way the app formats money ("$ 105.95").
const cents = LINES.split(',').reduce((sum, line) => {
  const [price, quantity] = line.split('*')
  return sum + Math.round(Number(price) * 100) * Number(quantity)
}, 0)

const delivery = typeof DELIVERY === 'undefined' ? 0 : Math.round(Number(DELIVERY) * 100)

output.expectedTotal = '$ ' + ((cents + delivery) / 100).toFixed(2)
