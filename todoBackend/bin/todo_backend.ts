#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TodoBackendStack } from '../lib/todo_backend-stack';

const app = new cdk.App();
new TodoBackendStack(app, 'TodoBackendStack');
