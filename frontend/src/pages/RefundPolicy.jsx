import React from 'react'
import LegalPageTemplate from '../Component/LegalPageTemplate'

function RefundPolicy() {
  return (
    <LegalPageTemplate
      slug="refund-policy"
      fallbackTitle="Refund Policy"
      fallbackContent="Refund eligibility depends on cancellation timing and booking status. Approved refunds are processed to the original payment method as per payment partner timelines."
    />
  )
}

export default RefundPolicy
