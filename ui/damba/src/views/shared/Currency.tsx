

interface CurrencyProps {
  amount: number | string;
  format?: string;
  tag?: string;
}

function Currency({ amount, format = 'fr-FR', tag = "HTG" }: CurrencyProps) {
  return (
    <>
    { tag } {  new Intl.NumberFormat(format).format(Number(amount)) } 
    </>
  )
}

export default Currency