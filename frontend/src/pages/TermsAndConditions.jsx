import React from 'react'
import LegalPageTemplate from '../Component/LegalPageTemplate'

function TermsAndConditions() {
  return (
    <LegalPageTemplate
      slug="terms-and-conditions"
      fallbackTitle="Terms & Conditions"
      fallbackContent="By using Zenstay, you agree to provide accurate details, follow booking rules, and respect property policies. Hosts and guests are responsible for lawful usage and valid information during listing and booking."
    />
  )
}

export default TermsAndConditions
