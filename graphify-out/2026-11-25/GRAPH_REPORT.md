# Graph Report - AI_Driven  (2026-11-25)

## Corpus Check
- 49 files · ~181,395 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .example 2, (none) 2, .traineddata 1)

## Summary
- 1445 nodes · 4022 edges · 84 communities (69 shown, 15 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 156 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- ref_crypto
- package.json
- server.js
- runAiPrecheck
- hydrateFromApi
- setInitialProperties
- AI-Driven E-Data Banking System
- index.js
- E-Data Banking System Project Structure
- AGENTS.md
- authentication/README.md
- backend/README.md
- schema.md
- deployment-hosting/README.md
- documents-storage/README.md
- reporting-charts/README.md
- search-engine/README.md
- dependencies
- migrate.js
- E-Data Banking System User Manual
- processing-worker.js
- backup.js
- compliance/README.md
- PRIVACY_POLICY_TEMPLATE.md
- USABILITY_EVALUATION.md
- backup-verify.js
- config-check.js
- External Services Activation Checklist
- commitMutationEffectsOnFiber
- Private pilot runbook
- PILOT_FINDINGS_TEMPLATE.md
- department-tabs.js
- flushPassiveEffects
- .addEventListener
- applySession
- commitRoot
- updateWorkInProgressHook
- restoreViewTransitionOnHostInstances
- completeWork
- acquireResource
- reconcileChildFibersImpl
- checkAttributeStringCoercion
- dispatchEventForPluginEventSystem
- beginWork
- resolveDispatcher
- push
- normalizeMarkupForTextOrAttribute
- dispatchEvent
- attemptEarlyBailoutIfNoScheduledUpdate
- beginWork
- mountWorkInProgressHook
- createElement
- scheduleUpdateOnFiber
- describeNode
- dispatchSetStateInternal
- elasticsearch.js
- renderRootConcurrent
- getComponentNameFromFiber
- restorePendingUpdaters
- attemptExplicitHydrationTarget
- popHydrationState
- enqueueUpdate
- describeBuiltInComponentFrame
- hideOrUnhideAllChildrenOnFiber
- workflow-smoke.js
- formatProdErrorMessage
- performWorkOnRoot
- replaySuspendedUnitOfWork
- ai-security.test.js
- hydrateRoot
- restore.js
- recursivelyFlushAsyncActWork
- enqueueConcurrentRenderForLane
- handleActionReturnValue
- file-scanner.js
- openArchivedAnalysis
- predeploy-check.js
- citations.js
- create-user.js
- getInstIfValueChanged
- renderNotifications
- createPdfDownload

## God Nodes (most connected - your core abstractions)
1. `push()` - 81 edges
2. `beginWork()` - 66 edges
3. `formatProdErrorMessage()` - 65 edges
4. `commitMutationEffectsOnFiber()` - 46 edges
5. `completeWork()` - 43 edges
6. `runWithFiberInDEV()` - 39 edges
7. `commitLayoutEffectOnFiber()` - 37 edges
8. `commitPassiveMountOnFiber()` - 30 edges
9. `captureCommitPhaseError()` - 30 edges
10. `setInitialProperties()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `migrate()` --calls--> `upsertSearchIndex()`  [EXTRACTED]
  backend/migrate.js → search-engine/index.js
- `analyzeJob()` --calls--> `analyzeCitationConsistency()`  [EXTRACTED]
  backend/processing-worker.js → search-engine/citations.js
- `analyzeJob()` --calls--> `upsertSearchIndex()`  [EXTRACTED]
  backend/processing-worker.js → search-engine/index.js
- `analyzeJob()` --calls--> `extractMetadataFromText()`  [EXTRACTED]
  backend/processing-worker.js → search-engine/metadata.js
- `reindex()` --calls--> `upsertSearchIndex()`  [EXTRACTED]
  backend/reindex-search.js → search-engine/index.js

## Import Cycles
- None detected.

## Communities (84 total, 15 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.02
Nodes (84): activityBody, adminAuditLogs, adminRefreshStatus, adminUsersBody, adviserSelect, analyzeAi, analyzeSubmission, archivedAnalysisMatches (+76 more)

### Community 1 - "ref_crypto"
Cohesion: 0.20
Nodes (7): bcryptjs, bcrypt, crypto, { Pool }, bcrypt, crypto, { Pool }

### Community 2 - "package.json"
Cohesion: 0.08
Nodes (23): extractUploadedText(), departments, root, description, main, name, private, version (+15 more)

### Community 3 - "server.js"
Cohesion: 0.06
Nodes (37): app, audit(), authenticate(), base32Decode(), bcrypt, clearCookie(), cookieOptions(), { createEmbedding, extractPdfText, scoreDocument, suggestions, upsertSearchIndex } (+29 more)

### Community 4 - "runAiPrecheck"
Cohesion: 0.23
Nodes (19): addNotification(), analyzeArchivedManuscript(), getAiScopeKey(), getAiState(), getHeatColor(), hideArchivedAnalysis(), prepareAiForNewManuscript(), renderCitationRecommendations() (+11 more)

### Community 5 - "hydrateFromApi"
Cohesion: 0.19
Nodes (20): apiRequest(), createBadge(), createNoteAction(), createRevisionAction(), createWorkflowAction(), escapeHtml(), hasRole(), hydrateAdminPanel() (+12 more)

### Community 6 - "setInitialProperties"
Cohesion: 0.14
Nodes (25): checkControlledValueProps(), checkForUnmatchedText(), commitUpdate(), getComponentNameFromOwner(), getCurrentFiberOwnerNameInDevOrNull(), getDeclarationErrorAddendum(), getToStringValue(), initInput() (+17 more)

### Community 8 - "AI-Driven E-Data Banking System"
Cohesion: 0.20
Nodes (8): Development methodology, Scope boundary, System Architecture, AI-Driven E-Data Banking System, Demo accounts, Important distinction, Run the complete application, Where to find things

### Community 9 - "index.js"
Cohesion: 0.22
Nodes (17): buildSearchDocument(), cosineSimilarity(), createEmbedding(), decodePdfLiteral(), expandQuery(), extractPdfText(), { extractPdfTextWithOcr }, { indexManuscript } (+9 more)

### Community 19 - "dependencies"
Cohesion: 0.06
Nodes (30): dependencies, bcryptjs, dotenv, @elastic/elasticsearch, express, jsonwebtoken, @napi-rs/canvas, openai (+22 more)

### Community 20 - "migrate.js"
Cohesion: 0.13
Nodes (11): bcrypt, fs, path, { Pool }, { upsertSearchIndex }, fs, http, mime (+3 more)

### Community 21 - "E-Data Banking System User Manual"
Cohesion: 0.40
Nodes (4): Administrator, E-Data Banking System User Manual, Faculty reviewer, Student researcher

### Community 22 - "processing-worker.js"
Cohesion: 0.22
Nodes (13): { analyzeCitationConsistency }, analyzeJob(), { checkExternalPlagiarism, reportPlagiarism }, claimJob(), { extractMetadataFromText }, startProcessingWorker(), { upsertSearchIndex }, checkExternalPlagiarism() (+5 more)

### Community 23 - "backup.js"
Cohesion: 0.20
Nodes (10): backupDir, crypto, encryptDump(), { execFile }, execFileAsync, fs, path, { pipeline } (+2 more)

### Community 27 - "backup-verify.js"
Cohesion: 0.20
Nodes (9): crypto, { execFile }, execFileAsync, fs, header, os, path, { promisify } (+1 more)

### Community 28 - "config-check.js"
Cohesion: 0.50
Nodes (3): checks, missingRequired, required

### Community 29 - "External Services Activation Checklist"
Cohesion: 0.29
Nodes (6): 1. OpenAI embeddings, 2. ClamAV, 3. External plagiarism provider, 4. Password-reset delivery, 5. Usability respondents, External Services Activation Checklist

### Community 30 - "commitMutationEffectsOnFiber"
Cohesion: 0.06
Nodes (107): addFragmentHandleToFiber(), addFragmentHandleToInstance(), bubbleNestedEffectDurations(), cache(), callCallback(), captureCommitPhaseError(), clearContainerSparingly(), clearHydrationBoundary() (+99 more)

### Community 31 - "Private pilot runbook"
Cohesion: 0.33
Nodes (5): Human usability evidence, Pilot gate, Prepare, Private pilot runbook, Workflow smoke test

### Community 33 - "department-tabs.js"
Cohesion: 0.03
Nodes (44): accumulateSuspenseyCommitOnFiber(), checkDCE(), checkIfFullyUnsuspended(), copyWithDeleteImpl(), copyWithRename(), copyWithRenameImpl(), copyWithSetImpl(), createSyntheticEvent() (+36 more)

### Community 34 - "flushPassiveEffects"
Cohesion: 0.21
Nodes (12): cancelCallback(), computeExpirationTime(), flushSyncWorkAcrossRoots_impl(), getHighestPriorityLanes(), getNextLanes(), performSyncWorkOnRoot(), performWorkOnRootViaSchedulerTask(), processRootScheduleInImmediateTask() (+4 more)

### Community 35 - ".addEventListener"
Cohesion: 0.09
Nodes (32): addEventListenerToChild(), blurActiveElementWithinFragment(), collectChildren(), collectClientRects(), commitMount(), defaultOnDefaultTransitionIndicator(), handleNavigateComplete(), startFakeNavigation() (+24 more)

### Community 36 - "applySession"
Cohesion: 0.50
Nodes (4): applyRoleAccess(), applySession(), formatRole(), getInitials()

### Community 37 - "commitRoot"
Cohesion: 0.13
Nodes (23): claimQueuedTransitionTypes(), commitDoubleInvokeEffectsInDEV(), commitRoot(), containsNode(), finalizeRender(), finishedViewTransition(), flushLayoutEffects(), flushMutationEffects() (+15 more)

### Community 38 - "updateWorkInProgressHook"
Cohesion: 0.08
Nodes (40): areHookInputsEqual(), basicStateReducer(), createFunctionComponentUpdateQueue(), createThenableState(), mountEffect(), mountEffectImpl(), mountImperativeHandle(), mountLayoutEffect() (+32 more)

### Community 39 - "restoreViewTransitionOnHostInstances"
Cohesion: 0.09
Nodes (38): applyViewTransitionName(), applyViewTransitionToHostInstances(), applyViewTransitionToHostInstancesRecursive(), callGetSnapshotBeforeUpdates(), commitAfterMutationEffectsOnFiber(), commitAppearingPairViewTransitions(), commitBeforeMutationEffects(), commitBeforeMutationEffects_complete() (+30 more)

### Community 40 - "completeWork"
Cohesion: 0.11
Nodes (37): advanceTimers(), bubbleProperties(), claimNextRetryLane(), completeWork(), cutOffTailIfNeeded(), describeAncestors(), describeDiff(), emitPendingHydrationWarnings() (+29 more)

### Community 41 - "acquireResource"
Cohesion: 0.17
Nodes (29): acquireResource(), adoptPreloadPropsForScript(), adoptPreloadPropsForStylesheet(), clearPendingLoadOnNode(), describeLinkForResourceErrorDEV(), escapeSelectorAttributeValueInsideDoubleQuotes(), getCrossOriginStringAs(), getResource() (+21 more)

### Community 42 - "reconcileChildFibersImpl"
Cohesion: 0.08
Nodes (68): bailoutOffscreenComponent(), coerceRef(), createChildReconciler(), createChild(), deleteChild(), deleteRemainingChildren(), mapRemainingChildren(), placeChild() (+60 more)

### Community 43 - "checkAttributeStringCoercion"
Cohesion: 0.16
Nodes (24): camelize(), checkAttributeStringCoercion(), coerceFormActionProp(), diffHydratedProperties(), extractEvents$1(), getAttributeAlias(), getValueForAttributeOnCustomComponent(), hydrateAttribute() (+16 more)

### Community 44 - "dispatchEventForPluginEventSystem"
Cohesion: 0.10
Nodes (29): accumulateEnterLeaveListenersForEvent(), accumulateTwoPhaseListeners(), batchedUpdates$1(), constructSelectEvent(), createAndAccumulateChangeEvent(), createDispatchListener(), dispatchEventForPluginEventSystem(), executeDispatch() (+21 more)

### Community 45 - "beginWork"
Cohesion: 0.22
Nodes (13): applyDerivedStateFromProps(), checkShouldComponentUpdate(), cloneUpdateQueue(), getComponentNameFromType(), initializeUpdateQueue(), processUpdateQueue(), setCurrentFiber(), setIsStrictModeForDevtools() (+5 more)

### Community 46 - "resolveDispatcher"
Cohesion: 0.09
Nodes (22): resolveDispatcher(), unstable_useCacheRefresh(), useActionState(), useCallback(), useContext(), useDebugValue(), useDeferredValue(), useEffect() (+14 more)

### Community 47 - "push"
Cohesion: 0.14
Nodes (24): addObjectDiffToProperties(), addObjectToProperties(), addValueToProperties(), buildHydrationDiffNode(), compare(), createLaneMap(), deferHiddenOffscreenComponent(), FiberRootNode() (+16 more)

### Community 48 - "normalizeMarkupForTextOrAttribute"
Cohesion: 0.20
Nodes (16): checkCSSPropertyStringCoercion(), checkFormFieldValueStringCoercion(), createPortal(), createPortal$1(), describeHydratableInstanceForDevWarnings(), diffHydratedStyles(), diffHydratedTextForDevWarnings(), getPropNameFromAttributeName() (+8 more)

### Community 49 - "dispatchEvent"
Cohesion: 0.15
Nodes (18): accumulateOrCreateContinuousQueuedReplayableEvent(), acquireSingletonInstance(), attemptContinuousHydration(), attemptReplayContinuousQueuedEvent(), attemptReplayContinuousQueuedEventInMap(), clearIfContinuousEvent(), dispatchContinuousEvent(), dispatchDiscreteEvent() (+10 more)

### Community 50 - "attemptEarlyBailoutIfNoScheduledUpdate"
Cohesion: 0.17
Nodes (20): attemptEarlyBailoutIfNoScheduledUpdate(), beginWork(), getChildHostContextProd(), getHostContext(), getOwnHostContext(), initSuspenseListRenderState(), mountHostRootWithoutHydrating(), pushHostContainer() (+12 more)

### Community 51 - "beginWork"
Cohesion: 0.19
Nodes (20): areSameKeyPath(), bailoutHooks(), bailoutOnAlreadyFinishedWork(), checkDidRenderIdHook(), checkIfContextChanged(), checkScheduledUpdateOrContext(), Component(), finishRenderingHooks() (+12 more)

### Community 52 - "mountWorkInProgressHook"
Cohesion: 0.12
Nodes (20): actionStateReducer(), mountActionState(), mountCallback(), mountDeferredValue(), mountDeferredValueImpl(), mountEvent(), mountId(), mountMemo() (+12 more)

### Community 53 - "createElement"
Cohesion: 0.12
Nodes (21): checkKeyStringCoercion(), cloneAndReplaceKey(), cloneElement(), createElement(), createHoistableInstance(), defineKeyPropWarningGetter(), DepartmentTabs(), elementRefGetterWithDeprecationWarning() (+13 more)

### Community 54 - "scheduleUpdateOnFiber"
Cohesion: 0.28
Nodes (9): ensureRootIsScheduled(), isConcurrentActEnvironment(), markRootUpdated$1(), pingSuspendedRoot(), resolveRetryWakeable(), retryDehydratedSuspenseBoundary(), retryTimedOutBoundary(), scheduleUpdateOnFiber() (+1 more)

### Community 55 - "describeNode"
Cohesion: 0.30
Nodes (15): added(), describeElementDiff(), describeExpandedElement(), describeFiberType(), describeNode(), describePropertiesDiff(), describePropValue(), describeSiblingFiber() (+7 more)

### Community 56 - "dispatchSetStateInternal"
Cohesion: 0.17
Nodes (21): addTransitionType(), chainThenableValue(), dispatchOptimisticSetState(), dispatchReducerAction(), dispatchSetState(), dispatchSetStateInternal(), enqueueConcurrentHookUpdate(), enqueueRenderPhaseUpdate() (+13 more)

### Community 57 - "elasticsearch.js"
Cohesion: 0.14
Nodes (13): migrate(), { Pool }, reindex(), { upsertSearchIndex }, @elastic/elasticsearch, pg, { Client }, enabled (+5 more)

### Community 58 - "renderRootConcurrent"
Cohesion: 0.26
Nodes (14): checkIfRootIsPrerendering(), finishQueueingConcurrentUpdates(), isThenableResolved(), logSuspendedWithDelayPhase(), markUpdateLaneFromFiberToRoot(), movePendingFibersToMemoized(), prepareFreshStack(), pushAsyncDispatcher() (+6 more)

### Community 59 - "getComponentNameFromFiber"
Cohesion: 0.25
Nodes (9): callComponentWillReceiveProps(), getComponentNameFromFiber(), initializeClassErrorUpdate(), logCaughtError(), markFailedErrorBoundaryForHotReloading(), updateHookTypesDev(), warnOnFunctionTypeImpl(), warnOnSymbolTypeImpl() (+1 more)

### Community 60 - "restorePendingUpdaters"
Cohesion: 0.40
Nodes (5): addFiberToLanesMap(), attachPingListener(), attachSuspenseRetryListeners(), getRetryCache(), restorePendingUpdaters()

### Community 61 - "attemptExplicitHydrationTarget"
Cohesion: 0.25
Nodes (11): assertIsMounted(), attemptExplicitHydrationTarget(), findCurrentFiberUsingSlowPath(), findInstanceBlockingTarget(), getActivityInstanceFromFiber(), getClosestInstanceFromNode(), getNearestMountedFiber(), getParentHydrationBoundary() (+3 more)

### Community 62 - "popHydrationState"
Cohesion: 0.33
Nodes (7): canHydrateHydrationBoundary(), canHydrateInstance(), canHydrateTextInstance(), getNextHydratable(), getNextHydratableInstanceAfterHydrationBoundary(), popHydrationState(), shouldSetTextContent()

### Community 63 - "enqueueUpdate"
Cohesion: 0.24
Nodes (11): captureCommitPhaseErrorOnRoot(), createCache(), createRootErrorUpdate(), createUpdate(), enqueueUpdate(), entangleTransitions(), entangleTransitionUpdate(), getContextForSubtree() (+3 more)

### Community 64 - "describeBuiltInComponentFrame"
Cohesion: 0.29
Nodes (10): describeBuiltInComponentFrame(), describeFiber(), describeFunctionComponentFrameWithoutLineNumber(), describeNativeComponentFrame(), disabledLog(), disableLogs(), formatOwnerStack(), getCurrentFiberStackInDev() (+2 more)

### Community 65 - "hideOrUnhideAllChildrenOnFiber"
Cohesion: 0.24
Nodes (10): hideDehydratedBoundary(), hideInstance(), hideOrUnhideAllChildren(), hideOrUnhideAllChildrenOnFiber(), hideOrUnhideDehydratedBoundary(), hideOrUnhideNearestPortals(), hideTextInstance(), unhideDehydratedBoundary() (+2 more)

### Community 66 - "workflow-smoke.js"
Cohesion: 0.31
Nodes (6): bcrypt, Client, crypto, main(), { Pool }, waitForProcessing()

### Community 67 - "formatProdErrorMessage"
Cohesion: 0.12
Nodes (20): checkIfUseWrappedInAsyncCatch(), createCapturedValueAtFiber(), createClassErrorUpdate(), dispatchActionState(), enqueueCapturedUpdate(), formatProdErrorMessage(), markRef(), noop$1() (+12 more)

### Community 68 - "performWorkOnRoot"
Cohesion: 0.23
Nodes (12): completeRoot(), completeRootWhenReady(), getEntangledLanes(), isRenderConsistentWithExternalStores(), logErroredRenderPhase(), logSuspendedRenderPhase(), markRootFinished(), markRootSuspended() (+4 more)

### Community 69 - "replaySuspendedUnitOfWork"
Cohesion: 0.21
Nodes (16): completeUnitOfWork(), getSuspendedThenable(), handleThrow(), logUncaughtError(), performUnitOfWork(), popToNextHostParent(), replayBeginWork(), replaySuspendedUnitOfWork() (+8 more)

### Community 70 - "ai-security.test.js"
Cohesion: 0.19
Nodes (10): clean(), extractMetadataFromText(), firstMatch(), { analyzeCitationConsistency }, assert, { extractMetadataFromText }, { reportPlagiarism }, { scanPdfForMalware } (+2 more)

### Community 71 - "hydrateRoot"
Cohesion: 0.21
Nodes (12): addTrappedEventListener(), createFiberRoot(), createRoot(), getEventPriority(), hydrateRoot(), isValidContainer(), listenToAllSupportedEvents(), listenToNativeEvent() (+4 more)

### Community 72 - "restore.js"
Cohesion: 0.20
Nodes (10): confirmed, crypto, { execFile }, execFileAsync, fs, header, os, path (+2 more)

### Community 73 - "recursivelyFlushAsyncActWork"
Cohesion: 0.53
Nodes (6): act(), aggregateErrors(), enqueueTask(), flushActQueue(), popActScope(), recursivelyFlushAsyncActWork()

### Community 74 - "enqueueConcurrentRenderForLane"
Cohesion: 0.20
Nodes (11): attemptHydrationAtCurrentPriority(), checkIfSnapshotChanged(), enqueueConcurrentRenderForLane(), forceStoreRerender(), getBumpedLaneForHydrationByLane(), getRootForUpdatedFiber(), scheduleFibersWithFamiliesRecursively(), scheduleRefresh() (+3 more)

### Community 75 - "handleActionReturnValue"
Cohesion: 0.70
Nodes (5): handleActionReturnValue(), notifyActionListeners(), onActionError(), onActionSuccess(), runActionStateAction()

### Community 76 - "file-scanner.js"
Cohesion: 0.22
Nodes (8): crypto, { execFile }, execFileAsync, fs, os, path, { promisify }, scanPdfForMalware()

### Community 77 - "openArchivedAnalysis"
Cohesion: 0.67
Nodes (3): openArchivedAnalysis(), renderArchivedAnalysisOptions(), updateArchivedDepartmentTabs()

### Community 78 - "predeploy-check.js"
Cohesion: 0.20
Nodes (8): failures, forbiddenDemoValues, fs, path, requiredFiles, root, { spawnSync }, tests

### Community 79 - "citations.js"
Cohesion: 0.53
Nodes (8): analyzeCitationConsistency(), apaAuthors(), authorsOf(), clean(), formatCitation(), mlaAuthors(), recommendCitations(), yearOf()

### Community 80 - "create-user.js"
Cohesion: 0.25
Nodes (7): args, bcrypt, name, password, { Pool }, role, username

### Community 81 - "getInstIfValueChanged"
Cohesion: 0.29
Nodes (7): getInstIfValueChanged(), getNodeFromInstance(), getTargetInstForClickEvent(), getTargetInstForInputEventPolyfill(), getTargetInstForInputOrChangeEvent(), isCheckable(), updateValueIfChanged()

### Community 82 - "renderNotifications"
Cohesion: 0.50
Nodes (5): activateDashboardLink(), buildSearchParams(), renderNotifications(), runRepositorySearch(), showView()

## Knowledge Gaps
- **1 isolated node(s):** `dotenv`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 353 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createChildReconciler()` connect `reconcileChildFibersImpl` to `department-tabs.js`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `commitMutationEffectsOnFiber()` (e.g. with `commitHydratedContainer()` and `commitTextUpdate()`) actually correct?**
  _`commitMutationEffectsOnFiber()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `dotenv` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.02127659574468085 - nodes in this community are weakly interconnected._
- **Why does `pg` connect `elasticsearch.js` to `ref_crypto`, `package.json`, `server.js`, `workflow-smoke.js`, `create-user.js`, `migrate.js`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0812807881773399 - nodes in this community are weakly interconnected._
- **Why does `bcryptjs` connect `ref_crypto` to `package.json`, `server.js`, `workflow-smoke.js`, `create-user.js`, `migrate.js`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._