export const getOrderConfig = (req, res) => {
  res.json({
    partialCodAdvancePercent: Number(process.env.PARTIAL_COD_ADVANCE_PERCENT)
  });
};