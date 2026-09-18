export const getOrderConfig = (req, res) => {
  res.json({
    partialCodAdvanceAmount: Number(process.env.PARTIAL_COD_ADVANCE_AMOUNT || 200)
  });
};