
const numberFormatter = (number: number | undefined | null): string => {
    const scientificToDecimal = (scientificNotation: string): number => {
        const decimalNumber = Number.parseFloat(scientificNotation)
        return decimalNumber
    }

    if (number) {
        let formattedNumber = number.toString()
        if (formattedNumber.includes("E")) {
            formattedNumber = scientificToDecimal(formattedNumber).toString()
        }
        let numberString = formattedNumber.toString()
        numberString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        return numberString
    }

    if (number === 0) {
        return "0"
    }

    return "0"
}

export default numberFormatter

  