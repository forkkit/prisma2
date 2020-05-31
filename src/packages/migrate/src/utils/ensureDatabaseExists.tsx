import path from 'path'
import { getSchema, getSchemaDir } from '@prisma/sdk'
import {
  BorderBox,
  DummySelectable,
  TabIndexProvider,
} from '@prisma/ink-components'
import { getConfig } from '@prisma/sdk'
import ansiEscapes from 'ansi-escapes'
import chalk from 'chalk'
import { Box, Color, Instance, render } from 'ink'
import Spinner from 'ink-spinner'
const AnySpinner: any = Spinner
import React, { useState } from 'react'
import { createDatabase } from '..'
import { canConnectToDatabase } from '../MigrateEngineCommands'
import { Link } from './Link'
import { DatabaseCredentials, uriToCredentials } from '@prisma/sdk'

export type MigrateAction = 'create' | 'apply' | 'unapply' | 'dev'

export async function ensureDatabaseExists(
  action: MigrateAction,
  killInk: boolean,
  forceCreate: boolean = false,
  schemaPath?: string,
) {
  const datamodel = await getSchema(schemaPath)
  const config = await getConfig({ datamodel })
  const activeDatasource =
    config.datasources.length === 1
      ? config.datasources[0]
      : config.datasources.find((d) => d.config.enabled === 'true') ||
        config.datasources[0]

  if (!activeDatasource) {
    throw new Error(`Couldn't find a datasource in the schema.prisma file`)
  }

  const schemaDir = (await getSchemaDir(schemaPath))!

  const canConnect = await canConnectToDatabase(
    activeDatasource.url.value,
    schemaDir,
  )
  if (canConnect === true) {
    return
  }
  const { code, message } = canConnect

  if (code !== 'P1003') {
    throw new Error(`${code}: ${message}`)
  }

  // last case: status === 'DatabaseDoesNotExist'

  if (!schemaDir) {
    throw new Error(`Could not locate ${schemaPath || 'schema.prisma'}`)
  }
  if (forceCreate) {
    await createDatabase(activeDatasource.url.value, schemaDir)
  } else {
    await interactivelyCreateDatabase(
      activeDatasource.url.value,
      action,
      schemaDir,
    )
  }
}

export async function interactivelyCreateDatabase(
  connectionString: string,
  action: MigrateAction,
  schemaDir: string,
): Promise<void> {
  await askToCreateDb(connectionString, action, schemaDir)
}

export async function askToCreateDb(
  connectionString: string,
  action: MigrateAction,
  schemaDir: string,
): Promise<void> {
  return new Promise((resolve) => {
    let app: Instance | undefined

    const onDone = () => {
      if (app) {
        app.unmount()
        app.waitUntilExit()
      }
      // .write as console.log introduces an unwanted linebreak here
      process.stdout.write(ansiEscapes.eraseLines(11)) // height of the dialog
      resolve()
    }

    app = render(
      <App>
        <TabIndexProvider>
          <CreateDatabaseDialog
            connectionString={connectionString}
            action={action}
            onDone={onDone}
            schemaDir={schemaDir}
          />
        </TabIndexProvider>
      </App>,
    )
  })
}

type AppState = {
  error?: Error
}

export class App extends React.Component<any, AppState> {
  state: AppState = {}
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <Box flexDirection="column">
          <Color red bold>
            Error in Create Database Dialog
          </Color>
          <Color>{this.state.error.stack || this.state.error.message}</Color>
        </Box>
      )
    }
    return this.props.children
  }
}

interface DialogProps {
  connectionString: string
  action: MigrateAction
  onDone: () => void
  schemaDir: string
}

const CreateDatabaseDialog: React.FC<DialogProps> = ({
  connectionString,
  action,
  onDone,
  schemaDir,
}) => {
  const [creating, setCreating] = useState(false)
  async function onSelect(shouldCreate: boolean) {
    if (shouldCreate) {
      setCreating(true)
      await createDatabase(connectionString, schemaDir)
      setCreating(false)
      onDone()
    } else {
      process.exit(0)
    }
  }
  const credentials = uriToCredentials(connectionString)
  const dbName = credentials.database
  const dbType =
    credentials.type === 'mysql'
      ? 'MySQL'
      : credentials.type === 'postgresql'
      ? 'PostgreSQL'
      : credentials.type === 'sqlite'
      ? 'Sqlite'
      : credentials.type

  const schemaWord = 'database'

  return (
    <Box flexDirection="column">
      <Box flexDirection="column">
        {action === 'dev' ? (
          <Color>
            You are trying to run <Color bold>prisma dev</Color> for {dbType}{' '}
            {schemaWord} <Color bold>{dbName}</Color>.
          </Color>
        ) : (
          <Color>
            You are trying to {action} a migration for {dbType} {schemaWord}{' '}
            <Color bold>{dbName}</Color>.
          </Color>
        )}
        <Color>
          A {schemaWord} with that name doesn't exist at{' '}
          <Color bold>{getDbLocation(credentials)}</Color>.
        </Color>
        <Color>Do you want to create the {schemaWord}?</Color>
      </Box>
      <BorderBox
        flexDirection="column"
        title={chalk.bold('Database options')}
        marginTop={1}
      >
        {creating ? (
          <DummySelectable tabIndex={0}>
            <Color cyan>
              <AnySpinner /> Creating {schemaWord} <Color bold>{dbName}</Color>
            </Color>
          </DummySelectable>
        ) : (
          <Link
            label="Yes"
            description={`Create new ${dbType} ${schemaWord} ${chalk.bold(
              dbName!,
            )}`}
            tabIndex={0}
            onSelect={() => onSelect(true)}
          />
        )}
        <Link
          label="No"
          description={`Don't create the ${schemaWord}`}
          tabIndex={1}
          onSelect={() => onSelect(false)}
        />
      </BorderBox>
    </Box>
  )
}

function getDbLocation(credentials: DatabaseCredentials): string {
  if (credentials.type === 'sqlite') {
    return credentials.uri!
  }

  return `${credentials.host}:${credentials.port}`
}
