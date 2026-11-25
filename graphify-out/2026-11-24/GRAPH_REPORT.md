# Graph Report - AI_Driven  (2026-11-24)

## Corpus Check
- 49 files · ~180,596 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .example 2, (none) 2, .traineddata 1)

## Summary
- 1430 nodes · 3986 edges · 71 communities (56 shown, 15 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 154 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- create-user.js
- package.json
- server.js
- runAiPrecheck
- hydrateFromApi
- renderNotifications
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
- scripts
- E-Data Banking System User Manual
- processing-worker.js
- backup.js
- compliance/README.md
- PRIVACY_POLICY_TEMPLATE.md
- USABILITY_EVALUATION.md
- file-scanner.js
- config-check.js
- External Services Activation Checklist
- commitMutationEffectsOnFiber
- Private pilot runbook
- PILOT_FINDINGS_TEMPLATE.md
- department-tabs.js
- renderRootConcurrent
- .addEventListener
- applySession
- createPdfDownload
- formatProdErrorMessage
- restoreViewTransitionOnHostInstances
- completeWork
- setInitialProperties
- reconcileChildFibersImpl
- prepareToHydrateHostInstance
- dispatchEventForPluginEventSystem
- updateClassComponent
- resolveDispatcher
- push
- updateDehydratedSuspenseComponent
- dispatchEvent
- attemptEarlyBailoutIfNoScheduledUpdate
- beginWork
- commitRoot
- mountWorkInProgressHook
- checkAttributeStringCoercion
- normalizeMarkupForTextOrAttribute
- dispatchSetStateInternal
- mapIntoArray
- describeNode
- getComponentNameFromFiber
- scheduleUpdateOnFiber
- createFiberFromTypeAndProps
- popHydrationState
- hydrateRoot
- describeBuiltInComponentFrame
- hideOrUnhideAllChildrenOnFiber
- startUpdateTimerByLane
- attemptExplicitHydrationTarget
- recursivelyFlushAsyncActWork
- handleActionReturnValue
- forceStoreRerender

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
- `analyzeJob()` --calls--> `upsertSearchIndex()`  [EXTRACTED]
  backend/processing-worker.js → search-engine/index.js
- `reindex()` --calls--> `upsertSearchIndex()`  [EXTRACTED]
  backend/reindex-search.js → search-engine/index.js
- `createPlagiarismReport()` --calls--> `reportPlagiarism()`  [EXTRACTED]
  backend/server.js → search-engine/plagiarism.js
- `analyzeJob()` --calls--> `analyzeCitationConsistency()`  [EXTRACTED]
  backend/processing-worker.js → search-engine/citations.js

## Import Cycles
- None detected.

## Communities (71 total, 15 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.02
Nodes (75): activityBody, adminAuditLogs, adminRefreshStatus, adminUsersBody, adviserSelect, analyzeAi, analyzeSubmission, categoryReports (+67 more)

### Community 1 - "create-user.js"
Cohesion: 0.08
Nodes (23): args, bcrypt, name, password, { Pool }, role, username, { Pool } (+15 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (26): departments, root, description, main, name, private, version, dotenv (+18 more)

### Community 3 - "server.js"
Cohesion: 0.06
Nodes (37): app, audit(), authenticate(), base32Decode(), bcrypt, clearCookie(), cookieOptions(), { createEmbedding, extractPdfText, scoreDocument, suggestions, upsertSearchIndex } (+29 more)

### Community 4 - "runAiPrecheck"
Cohesion: 0.19
Nodes (16): addNotification(), escapeHtml(), getAiScopeKey(), getAiState(), getHeatColor(), loadSearchSuggestions(), prepareAiForNewManuscript(), readPdfFile() (+8 more)

### Community 5 - "hydrateFromApi"
Cohesion: 0.24
Nodes (17): apiRequest(), createBadge(), createNoteAction(), createRevisionAction(), createWorkflowAction(), hasRole(), hydrateAdminPanel(), hydrateAdvisers() (+9 more)

### Community 6 - "renderNotifications"
Cohesion: 0.50
Nodes (5): activateDashboardLink(), buildSearchParams(), renderNotifications(), runRepositorySearch(), showView()

### Community 8 - "AI-Driven E-Data Banking System"
Cohesion: 0.20
Nodes (8): Development methodology, Scope boundary, System Architecture, AI-Driven E-Data Banking System, Demo accounts, Important distinction, Run the complete application, Where to find things

### Community 9 - "index.js"
Cohesion: 0.16
Nodes (23): migrate(), reindex(), extractUploadedText(), indexManuscript(), buildSearchDocument(), cosineSimilarity(), createEmbedding(), decodePdfLiteral() (+15 more)

### Community 19 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, bcryptjs, dotenv, @elastic/elasticsearch, express, jsonwebtoken, @napi-rs/canvas, openai (+7 more)

### Community 20 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, adviser-registration:smoke, backup, backup:restore, backup:verify, build:react, config:check, create-user (+7 more)

### Community 21 - "E-Data Banking System User Manual"
Cohesion: 0.40
Nodes (4): Administrator, E-Data Banking System User Manual, Faculty reviewer, Student researcher

### Community 22 - "processing-worker.js"
Cohesion: 0.10
Nodes (31): { analyzeCitationConsistency }, analyzeJob(), { checkExternalPlagiarism, reportPlagiarism }, claimJob(), { extractMetadataFromText }, startProcessingWorker(), { upsertSearchIndex }, analyzeCitationConsistency() (+23 more)

### Community 23 - "backup.js"
Cohesion: 0.20
Nodes (10): backupDir, crypto, encryptDump(), { execFile }, execFileAsync, fs, path, { pipeline } (+2 more)

### Community 27 - "file-scanner.js"
Cohesion: 0.04
Nodes (46): crypto, { execFile }, execFileAsync, fs, header, os, path, { promisify } (+38 more)

### Community 28 - "config-check.js"
Cohesion: 0.50
Nodes (3): checks, missingRequired, required

### Community 29 - "External Services Activation Checklist"
Cohesion: 0.29
Nodes (6): 1. OpenAI embeddings, 2. ClamAV, 3. External plagiarism provider, 4. Password-reset delivery, 5. Usability respondents, External Services Activation Checklist

### Community 30 - "commitMutationEffectsOnFiber"
Cohesion: 0.06
Nodes (109): addFragmentHandleToFiber(), addFragmentHandleToInstance(), bubbleNestedEffectDurations(), cache(), callCallback(), callGetSnapshotBeforeUpdates(), captureCommitPhaseError(), clearContainerSparingly() (+101 more)

### Community 31 - "Private pilot runbook"
Cohesion: 0.33
Nodes (5): Human usability evidence, Pilot gate, Prepare, Private pilot runbook, Workflow smoke test

### Community 33 - "department-tabs.js"
Cohesion: 0.03
Nodes (26): checkDCE(), checkIfFullyUnsuspended(), copyWithDeleteImpl(), copyWithRename(), copyWithRenameImpl(), copyWithSetImpl(), createSyntheticEvent(), entangleAsyncAction() (+18 more)

### Community 34 - "renderRootConcurrent"
Cohesion: 0.05
Nodes (74): addFiberToLanesMap(), attachPingListener(), batchedUpdates$1(), cancelCallback(), checkIfRootIsPrerendering(), completeRoot(), completeRootWhenReady(), completeUnitOfWork() (+66 more)

### Community 35 - ".addEventListener"
Cohesion: 0.08
Nodes (37): addEventListenerToChild(), addTrappedEventListener(), blurActiveElementWithinFragment(), collectChildren(), collectClientRects(), commitMount(), defaultOnDefaultTransitionIndicator(), handleNavigateComplete() (+29 more)

### Community 36 - "applySession"
Cohesion: 0.29
Nodes (8): applyRoleAccess(), applySession(), formatRole(), getInitials(), restoreAiState(), setCount(), setPercent(), updateDashboard()

### Community 38 - "formatProdErrorMessage"
Cohesion: 0.07
Nodes (46): actionStateReducer(), areHookInputsEqual(), assertIsMounted(), attachSuspenseRetryListeners(), basicStateReducer(), checkIfUseWrappedInAsyncCatch(), createFunctionComponentUpdateQueue(), createThenableState() (+38 more)

### Community 39 - "restoreViewTransitionOnHostInstances"
Cohesion: 0.09
Nodes (40): accumulateSuspenseyCommitOnFiber(), applyViewTransitionName(), applyViewTransitionToHostInstances(), applyViewTransitionToHostInstancesRecursive(), commitAfterMutationEffectsOnFiber(), commitAppearingPairViewTransitions(), commitBeforeMutationEffects(), commitBeforeMutationEffects_complete() (+32 more)

### Community 40 - "completeWork"
Cohesion: 0.10
Nodes (39): advanceTimers(), bubbleProperties(), claimNextRetryLane(), compare(), completeWork(), cutOffTailIfNeeded(), describeAncestors(), describeDiff() (+31 more)

### Community 41 - "setInitialProperties"
Cohesion: 0.14
Nodes (36): acquireResource(), adoptPreloadPropsForScript(), adoptPreloadPropsForStylesheet(), clearPendingLoadOnNode(), createElement(), createHoistableInstance(), defineKeyPropWarningGetter(), DepartmentTabs() (+28 more)

### Community 42 - "reconcileChildFibersImpl"
Cohesion: 0.18
Nodes (36): coerceRef(), createChildReconciler(), createChild(), deleteChild(), deleteRemainingChildren(), mapRemainingChildren(), placeChild(), placeSingleChild() (+28 more)

### Community 43 - "prepareToHydrateHostInstance"
Cohesion: 0.10
Nodes (29): checkControlledValueProps(), checkForUnmatchedText(), commitHostUpdate(), commitUpdate(), getComponentNameFromOwner(), getCurrentFiberOwnerNameInDevOrNull(), getDeclarationErrorAddendum(), getToStringValue() (+21 more)

### Community 44 - "dispatchEventForPluginEventSystem"
Cohesion: 0.10
Nodes (28): accumulateEnterLeaveListenersForEvent(), accumulateTwoPhaseListeners(), createAndAccumulateChangeEvent(), createDispatchListener(), dispatchEventForPluginEventSystem(), executeDispatch(), getData(), getDataFromCustomEvent() (+20 more)

### Community 45 - "updateClassComponent"
Cohesion: 0.11
Nodes (22): applyDerivedStateFromProps(), areSameKeyPath(), checkIfContextChanged(), checkShouldComponentUpdate(), cloneUpdateQueue(), Component(), dispatchActionState(), finishRenderingHooks() (+14 more)

### Community 46 - "resolveDispatcher"
Cohesion: 0.08
Nodes (24): resolveDispatcher(), TransitionAwareHostComponent(), unstable_useCacheRefresh(), useActionState(), useCallback(), useContext(), useDebugValue(), useDeferredValue() (+16 more)

### Community 47 - "push"
Cohesion: 0.15
Nodes (22): addObjectDiffToProperties(), addObjectToProperties(), addValueToProperties(), createLaneMap(), deferHiddenOffscreenComponent(), FiberRootNode(), getArrayKind(), getHydratableHoistableCache() (+14 more)

### Community 48 - "updateDehydratedSuspenseComponent"
Cohesion: 0.18
Nodes (22): bailoutOffscreenComponent(), canHydrateHydrationBoundary(), getBumpedLaneForHydration(), getRemainingWorkInPrimaryTree(), getSuspendedCache(), getSuspendedTreeContext(), isSuspenseInstanceFallback(), markRenderDerivedCause() (+14 more)

### Community 49 - "dispatchEvent"
Cohesion: 0.13
Nodes (21): accumulateOrCreateContinuousQueuedReplayableEvent(), acquireSingletonInstance(), attemptContinuousHydration(), attemptHydrationAtCurrentPriority(), attemptReplayContinuousQueuedEvent(), attemptReplayContinuousQueuedEventInMap(), clearIfContinuousEvent(), dispatchContinuousEvent() (+13 more)

### Community 50 - "attemptEarlyBailoutIfNoScheduledUpdate"
Cohesion: 0.12
Nodes (21): attemptEarlyBailoutIfNoScheduledUpdate(), findFirstSuspended(), findLastContentRow(), getChildHostContextProd(), getHostContext(), getOwnHostContext(), initSuspenseListRenderState(), isSuspenseInstancePending() (+13 more)

### Community 51 - "beginWork"
Cohesion: 0.25
Nodes (21): bailoutHooks(), bailoutOnAlreadyFinishedWork(), beginWork(), checkDidRenderIdHook(), checkScheduledUpdateOrContext(), mountHostRootWithoutHydrating(), prepareToReadContext(), pushMaterializedTreeId() (+13 more)

### Community 52 - "commitRoot"
Cohesion: 0.11
Nodes (21): claimQueuedTransitionTypes(), commitRoot(), constructSelectEvent(), containsNode(), flushLayoutEffects(), flushMutationEffects(), getActiveElement(), getActiveElementDeep() (+13 more)

### Community 53 - "mountWorkInProgressHook"
Cohesion: 0.11
Nodes (21): mountCallback(), mountDeferredValue(), mountDeferredValueImpl(), mountEffect(), mountEffectImpl(), mountEvent(), mountId(), mountImperativeHandle() (+13 more)

### Community 54 - "checkAttributeStringCoercion"
Cohesion: 0.20
Nodes (20): checkAttributeStringCoercion(), coerceFormActionProp(), diffHydratedProperties(), extractEvents$1(), getAttributeAlias(), getValueForAttributeOnCustomComponent(), hydrateAttribute(), hydrateBooleanAttribute() (+12 more)

### Community 55 - "normalizeMarkupForTextOrAttribute"
Cohesion: 0.16
Nodes (19): camelize(), checkCSSPropertyStringCoercion(), checkFormFieldValueStringCoercion(), createPortal(), createPortal$1(), describeHydratableInstanceForDevWarnings(), diffHydratedStyles(), diffHydratedTextForDevWarnings() (+11 more)

### Community 56 - "dispatchSetStateInternal"
Cohesion: 0.19
Nodes (18): addTransitionType(), chainThenableValue(), dispatchOptimisticSetState(), dispatchReducerAction(), dispatchSetState(), dispatchSetStateInternal(), enqueueConcurrentHookUpdate(), enqueueRenderPhaseUpdate() (+10 more)

### Community 57 - "mapIntoArray"
Cohesion: 0.14
Nodes (17): checkKeyStringCoercion(), cloneAndReplaceKey(), cloneElement(), elementRefGetterWithDeprecationWarning(), escape(), getElementKey(), getOwner(), hasValidKey() (+9 more)

### Community 58 - "describeNode"
Cohesion: 0.30
Nodes (15): added(), describeElementDiff(), describeExpandedElement(), describeFiberType(), describeNode(), describePropertiesDiff(), describePropValue(), describeSiblingFiber() (+7 more)

### Community 59 - "getComponentNameFromFiber"
Cohesion: 0.20
Nodes (12): callComponentWillReceiveProps(), enqueueUpdate(), getComponentNameFromFiber(), getRootForUpdatedFiber(), initializeClassErrorUpdate(), logCaughtError(), markFailedErrorBoundaryForHotReloading(), updateHookTypesDev() (+4 more)

### Community 60 - "scheduleUpdateOnFiber"
Cohesion: 0.21
Nodes (12): captureCommitPhaseErrorOnRoot(), createRootErrorUpdate(), createUpdate(), ensureRootIsScheduled(), isConcurrentActEnvironment(), markRootUpdated$1(), pingSuspendedRoot(), resolveRetryWakeable() (+4 more)

### Community 61 - "createFiberFromTypeAndProps"
Cohesion: 0.26
Nodes (12): createCache(), createFiber(), createFiberFromDehydratedFragment(), createFiberFromFragment(), createFiberFromTypeAndProps(), createFiberImplClass(), createFiberRoot(), createWorkInProgress() (+4 more)

### Community 62 - "popHydrationState"
Cohesion: 0.22
Nodes (11): buildHydrationDiffNode(), canHydrateInstance(), canHydrateTextInstance(), createCapturedValueAtFiber(), getNextHydratable(), getNextHydratableInstanceAfterHydrationBoundary(), mountActionState(), popHydrationState() (+3 more)

### Community 63 - "hydrateRoot"
Cohesion: 0.22
Nodes (10): createRoot(), getEventPriority(), hydrateRoot(), isValidContainer(), listenToAllSupportedEvents(), listenToNativeEvent(), ReactDOMHydrationRoot(), ReactDOMRoot() (+2 more)

### Community 64 - "describeBuiltInComponentFrame"
Cohesion: 0.29
Nodes (10): describeBuiltInComponentFrame(), describeFiber(), describeFunctionComponentFrameWithoutLineNumber(), describeNativeComponentFrame(), disabledLog(), disableLogs(), formatOwnerStack(), getCurrentFiberStackInDev() (+2 more)

### Community 65 - "hideOrUnhideAllChildrenOnFiber"
Cohesion: 0.24
Nodes (10): hideDehydratedBoundary(), hideInstance(), hideOrUnhideAllChildren(), hideOrUnhideAllChildrenOnFiber(), hideOrUnhideDehydratedBoundary(), hideOrUnhideNearestPortals(), hideTextInstance(), unhideDehydratedBoundary() (+2 more)

### Community 66 - "startUpdateTimerByLane"
Cohesion: 0.28
Nodes (9): entangleTransitions(), getContextForSubtree(), markRootEntangled(), refreshCache(), resolveEventTimeStamp(), resolveEventType(), startHostActionTimer(), startUpdateTimerByLane() (+1 more)

### Community 67 - "attemptExplicitHydrationTarget"
Cohesion: 0.32
Nodes (8): attemptExplicitHydrationTarget(), findInstanceBlockingTarget(), getActivityInstanceFromFiber(), getClosestInstanceFromNode(), getParentHydrationBoundary(), getSuspenseInstanceFromFiber(), runWithPriority(), scheduleReplayQueueIfNeeded()

### Community 68 - "recursivelyFlushAsyncActWork"
Cohesion: 0.53
Nodes (6): act(), aggregateErrors(), enqueueTask(), flushActQueue(), popActScope(), recursivelyFlushAsyncActWork()

### Community 69 - "handleActionReturnValue"
Cohesion: 0.70
Nodes (5): handleActionReturnValue(), notifyActionListeners(), onActionError(), onActionSuccess(), runActionStateAction()

### Community 70 - "forceStoreRerender"
Cohesion: 0.67
Nodes (4): checkIfSnapshotChanged(), forceStoreRerender(), subscribeToStore(), updateStoreInstance()

## Knowledge Gaps
- **1 isolated node(s):** `dotenv`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 343 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createChildReconciler()` connect `reconcileChildFibersImpl` to `department-tabs.js`, `createFiberFromTypeAndProps`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `commitMutationEffectsOnFiber()` (e.g. with `commitHydratedContainer()` and `commitTextUpdate()`) actually correct?**
  _`commitMutationEffectsOnFiber()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `dotenv` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.023529411764705882 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `create-user.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07954545454545454 - nodes in this community are weakly interconnected._
- **Why does `pg` connect `create-user.js` to `server.js`, `package.json`, `file-scanner.js`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._