import React from 'react'
import LegalPageTemplate from '../Component/LegalPageTemplate'

function PrivacyPolicy() {
  return (
    <LegalPageTemplate
      slug="privacy-policy"
      fallbackTitle="Privacy Policy"
      fallbackContent="We collect only required account and booking information to provide the service. Your personal information is not sold to third parties. Data is used for bookings, account management, and service communication."
    />
  )
}

export default PrivacyPolicy
