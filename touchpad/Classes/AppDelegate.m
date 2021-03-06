//
//  AppDelegate.m
//  FingerMgmt
//
//  Created by Johan Nordberg on 2012-12-14.
//  Copyright (c) 2012 FFFF00 Agents AB. All rights reserved.
//

#import "AppDelegate.h"
#import "TouchPoint.h"
#import "FingerMgmt.h"

// header for MultitouchSupport.framework
#import "MultiTouch.h"

@import SocketIO;

static int touchCallback(int device, mtTouch *data, int num_fingers, double timestamp, int frame) {

  // create TouchPoint objects for all touches
  NSMutableArray *points = [[NSMutableArray alloc] initWithCapacity:num_fingers];
  for (int i = 0; i < num_fingers; i++) {
    TouchPoint *point = [[TouchPoint alloc] initWithTouch:&data[i]];
    [points addObject:point];
  }

  // forward array of TouchPoints to AppDelegate on the main thread
  AppDelegate *delegate = (AppDelegate *)[NSApp delegate];
  [delegate performSelectorOnMainThread:@selector(didTouchWithPoints:) withObject:points waitUntilDone:NO];

  // no idea what the return code should be, guessing 0 for success
  return 0;
}

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification {
    
    self.count = 0;
    
    NSURL* url = [[NSURL alloc] initWithString:@"http://127.0.0.1:3000"];
    self.socket = [[SocketIOClient alloc] initWithSocketURL:url config:@{@"log": @YES, @"compress": @NO}];
    
    [self.socket on:@"connect" callback:^(NSArray* data, SocketAckEmitter* ack) {
        NSLog(@"socket connected");
    }];

    [self.socket connect];

    // get a list of all multitouch devices
    NSArray *deviceList = (NSArray *)CFBridgingRelease(MTDeviceCreateList());
    for (int i = 0; i < [deviceList count]; i++) {
        // start sending touches to callback
        MTDeviceRef device = (__bridge MTDeviceRef)[deviceList objectAtIndex:i];
        MTRegisterContactFrameCallback(device, touchCallback);
        MTDeviceStart(device, 0);
    }
    printf("Starting finger tracking");
}

- (void)didTouchWithPoints:(NSArray *)points {
    if([points count] == 1) {
        [self send: points[0]];
    }
}

- (void)send:(TouchPoint*) point {
    float x = [point x];
    float y = 1 - [point y];
    int width = kTrackpadWidth;
    int height = kTrackpadHeight;
    
    if(++self.count == 4) {
        [self.socket emit:@"trackpad-event" with:@[@{@"x": @(x), @"y": @(y), @"width": @(width), @"height": @(height)}]];
        printf("%f,%f,%d,%d\n", x, y, width, height);
        self.count = 0;
    }
}

@end
