import Debug from '@prisma/debug'
import InkSpinner from 'ink-spinner'
import React from 'react'
const debugEnabled = Debug.enabled('migrate')

export const Spinner: React.FC<any> = (props) =>
  debugEnabled ? <>...</> : <InkSpinner {...props} />
